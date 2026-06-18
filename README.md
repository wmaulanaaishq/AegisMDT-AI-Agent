<div align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/e/ea/Blastic_plasmacytoid_dendritic_cell_neoplasm.jpg" width="120" alt="AegisMDT Logo" style="border-radius: 50%" />
  
  # AegisMDT AI Agent
  **Secure Multi-Agent Orchestration for Rare Oncology**

  [![Band SDK](https://img.shields.io/badge/Band%20SDK-Integrated-blue.svg)](https://band.ai)
  [![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688.svg)](https://fastapi.tiangolo.com)
  [![Next.js](https://img.shields.io/badge/Next.js-Frontend-black.svg)](https://nextjs.org)
  [![Featherless](https://img.shields.io/badge/Featherless-Qwen3--32B-orange.svg)](https://featherless.ai)

  *Track 3: Regulated & High-Stakes Workflows*
</div>

---

## 🔬 Overview

**AegisMDT** is an advanced, military-grade Virtual Medical Board (MDT - Multi-Disciplinary Team) prototype built for the Hackathon. It leverages a swarm of specialized AI agents to diagnose, prognosticate, and recommend clinical trials for highly complex and rare oncological cases (e.g., Blastic Plasmacytoid Dendritic Cell Neoplasm / BPDCN).

Instead of relying on a single AI model that can hallucinate, AegisMDT utilizes **Iterative Consensus Ensemble (ICE) Protocol**, forcing multiple specialized AI agents (Pathologist, Oncologist, Clinical Trial Matcher) to debate and cite medical literature until a high-confidence consensus is reached.

## ✨ Key Features

- **Multi-Modal Vision Agent**: Upload microscopy/Whole Slide Images (WSI). The Pathology Agent analyzes both text and visual morphology.
- **Agentic Web Search (RAG)**: Agents autonomously query the Semantic Scholar / PubMed graph API to ground their arguments in real, peer-reviewed medical literature.
- **Iterative Consensus Ensemble (ICE)**: An AI Moderator forces agents to debate if their confidence scores are low or if their assessments conflict.
- **Human-in-the-Loop Steering**: Doctors are never replaced. They can intervene mid-debate using the "Request Revision" feature to steer the AI's clinical direction.
- **Enterprise-Grade Resilience**: Features Pydantic defensive parsing and Graceful Fallback Mode if third-party cloud orchestration fails.
- **EMR Ready**: One-click generation of print-ready medical reports for Electronic Medical Records.

## 🏗️ Architecture

AegisMDT consists of a separated decoupled architecture:
1. **Frontend**: Next.js 14, TailwindCSS, Framer Motion (for dynamic kinetic agent message bubbles).
2. **Backend**: FastAPI, WebSockets (for real-time agent streaming).
3. **Orchestrator**: Custom asynchronous Python event loop handling parallel agent tasks.
4. **Vector Store**: ChromaDB for latent memory and historical case RAG.

### The Agent Swarm
- 🛡️ **Privacy Agent**: Strips PII and anonymizes patient data before it hits the network.
- 🔬 **Pathology Agent**: Analyzes morphology and genomic mutations.
- 📊 **Prognostication Agent**: Calculates IPSS-R risks and survival rates.
- 🧪 **Clinical Trial Agent**: Matches patient biomarkers with ongoing trials.
- ⚖️ **Moderator Agent**: Resolves conflicts and builds the final clinical consensus.

## 🚀 Quick Start (Local Deployment)

### Prerequisites
- Python 3.10+
- Node.js 18+
- API Keys: Featherless AI (or AIMLAPI), ChromaDB, Semantic Scholar.

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # On Windows
pip install -r requirements.txt

# Configure Environment Variables
cp .env.example .env
# Fill in your FEATHERLESS_API_KEY in .env

# Run the Server
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔒 Security & Privacy Notice
This is a hackathon prototype. While it features PII stripping mechanisms, do **not** upload real patient data (PHI) to this public iteration. 

