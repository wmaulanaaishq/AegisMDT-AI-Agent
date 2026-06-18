"""AegisMDT LLM Client — Dual-provider abstraction over Featherless AI and AIML API."""
from __future__ import annotations

import logging
from typing import Optional

from openai import AsyncOpenAI

from config import settings, LLMConfig

logger = logging.getLogger(__name__)


def _build_client(cfg: LLMConfig) -> AsyncOpenAI:
    return AsyncOpenAI(base_url=cfg.base_url, api_key=cfg.api_key)


# Pre-built clients
_featherless = _build_client(settings.featherless)
_aimlapi = _build_client(settings.aimlapi)


async def call_llm(
    system_prompt: str,
    user_message: str,
    provider: str = "featherless",
    temperature: float = 0.3,
    max_tokens: int = 4096,
    json_mode: bool = False,
    image_url: Optional[str] = None,
) -> tuple[str, str]:
    """Call an LLM via the chosen provider.

    Returns:
        tuple[str, str]: (content, thinking_trace)
    """
    if provider == "aimlapi":
        client, model = _aimlapi, settings.aimlapi.model
    else:
        client, model = _featherless, settings.featherless.model

    if image_url:
        user_content = [
            {"type": "text", "text": user_message},
            {"type": "image_url", "image_url": {"url": image_url}}
        ]
    else:
        user_content = user_message

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_content},
    ]

    kwargs: dict = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}

    try:
        response = await client.chat.completions.create(**kwargs)
        content = response.choices[0].message.content or ""
        
        # Extract <think>...</think> tags and save them as thinking_trace
        import re
        thinking_trace = ""
        think_match = re.search(r'<think>(.*?)</think>', content, flags=re.DOTALL)
        if think_match:
            thinking_trace = think_match.group(1).strip()
            content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL).strip()
        
        # If the output contains a JSON markdown block, extract just the JSON
        if kwargs.get('response_format') == {'type': 'json_object'} or 'json_mode' in kwargs: # handle custom json_mode flag if passed
            json_match = re.search(r'```(?:json)?\s*(.*?)\s*```', content, flags=re.DOTALL)
            if json_match:
                content = json_match.group(1).strip()
        
        logger.info("LLM [%s/%s] responded (%d chars)", provider, model, len(content))
        return content, thinking_trace
    except Exception as exc:
        logger.error("LLM call failed: %s", str(exc))
        raise


async def call_llm_json(system_prompt: str, user_message: str, max_retries: int = 2, image_url: Optional[str] = None, **kwargs) -> tuple[dict, str]:
    """Wrapper around call_llm that parses JSON and automatically retries on failure.
    Returns: tuple[dict, str] -> (json_dict, thinking_trace)
    """
    import json
    
    # Ensure json_mode is requested
    kwargs['json_mode'] = True
    
    current_user_message = user_message
    
    for attempt in range(max_retries + 1):
        try:
            response_text, thinking_trace = await call_llm(system_prompt, current_user_message, **kwargs)
            return json.loads(response_text), thinking_trace
        except json.JSONDecodeError as e:
            logger.warning(f"JSON parsing failed on attempt {attempt + 1}: {e}. LLM Output: {response_text[:100]}...")
            if attempt < max_retries:
                # Add self-correction feedback
                current_user_message += f"\n\nSystem Error: Your previous response failed to parse as valid JSON. Error: {str(e)}. Please correct your formatting and output STRICTLY valid JSON without any prefix text."
                logger.info(f"Retrying LLM call (attempt {attempt + 2}/{max_retries + 1})...")
            else:
                logger.error("Max retries reached for JSON parsing.")
                raise ValueError("Failed to obtain valid JSON from LLM after multiple attempts.")


async def call_llm_with_history(
    system_prompt: str,
    messages: list[dict],
    provider: str = "featherless",
    temperature: float = 0.3,
    max_tokens: int = 4096,
) -> tuple[str, str]:
    """Call LLM with a full conversation history for multi-turn reasoning."""
    if provider == "aimlapi":
        client, model = _aimlapi, settings.aimlapi.model
    else:
        client, model = _featherless, settings.featherless.model

    full_messages = [{"role": "system", "content": system_prompt}] + messages

    try:
        response = await client.chat.completions.create(
            model=model,
            messages=full_messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        content = response.choices[0].message.content or ""
        import re
        thinking_trace = ""
        think_match = re.search(r'<think>(.*?)</think>', content, flags=re.DOTALL)
        if think_match:
            thinking_trace = think_match.group(1).strip()
            content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL).strip()
            
        return content, thinking_trace
    except Exception as exc:
        logger.error("LLM history call failed [%s/%s]: %s", provider, model, exc)
        raise


def fold_context(text: str, max_chars: int = 12000) -> str:
    """Context folding — truncate and summarize overly long texts.

    This prevents context rot by keeping agent inputs within manageable bounds.
    """
    if len(text) <= max_chars:
        return text
    # Keep first and last portions, mark middle as folded
    head = text[:max_chars // 2]
    tail = text[-(max_chars // 2):]
    return f"{head}\n\n[... CONTEXT FOLDED: {len(text) - max_chars} chars omitted for brevity ...]\n\n{tail}"
