# MiniLibX Documentation Search Engine

A documentation search engine for the **MiniLibX** C graphics library, built as a capstone project for the **Qdrant Essential Course**.

## Overview

MiniLibX (42paris/minilibx-linux) is a C graphics library used by thousands of 42 school students, yet it has no structured documentation. This project:

1. Fetches source code from GitHub via PyGithub
2. Generates structured docs from C code using an LLM with Pydantic structured output
3. Ingests into Qdrant with hybrid search (dense + sparse + ColBERT reranking)
4. Evaluates with Recall@10, MRR, and latency metrics

## Setup

### Prerequisites

- Python 3.11+
- A Qdrant Cloud cluster (or local Docker instance)
- An OpenAI-compatible LLM API key
- A GitHub personal access token

### Installation

```bash
cp .env.example .env
# Edit .env with your credentials
uv sync # or pip install -r requirements.txt
```

### Running

Open `capstone.ipynb` in Jupyter and run all cells. The notebook is self-contained.

