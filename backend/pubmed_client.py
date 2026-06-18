import httpx
import logging
import urllib.parse

logger = logging.getLogger(__name__)

async def fetch_literature_context(query: str, limit: int = 2) -> str:
    """Fetch real medical abstracts from Semantic Scholar API to ground the LLM debate."""
    encoded_query = urllib.parse.quote(query)
    url = f"https://api.semanticscholar.org/graph/v1/paper/search?query={encoded_query}&limit={limit}&fields=title,abstract,url,year"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            papers = data.get("data", [])
            if not papers:
                return "No relevant literature found."
                
            context_blocks = []
            for p in papers:
                title = p.get("title", "Unknown Title")
                year = p.get("year", "Unknown Year")
                abstract = p.get("abstract", "No abstract available.")
                if abstract and len(abstract) > 1000:
                    abstract = abstract[:1000] + "..."
                url_link = p.get("url", "")
                
                block = f"- **{title}** ({year})\n  *Abstract*: {abstract}\n  *URL*: {url_link}"
                context_blocks.append(block)
                
            return "\n\n".join(context_blocks)
    except Exception as e:
        logger.warning(f"Failed to fetch literature context: {e}")
        return "Failed to retrieve literature context."
