import chromadb
import logging

logger = logging.getLogger(__name__)

# ChromaDB Cloud config provided by user
CHROMA_API_KEY = "ck-5mjdemAmpoBwbhUieRTYP1SnWPa6RUf6yiwLeZZ5PSFz"
CHROMA_TENANT = "78e6fff5-31a9-44c9-a813-8ed1ed673b73"
CHROMA_DATABASE = "Cyllene"

try:
    # Requires chromadb version that supports CloudClient
    client = chromadb.CloudClient(
        api_key=CHROMA_API_KEY,
        tenant=CHROMA_TENANT,
        database=CHROMA_DATABASE
    )
    # Get or create collection
    collection = client.get_or_create_collection(name="medical_cases")
    logger.info("ChromaDB Cloud connected successfully.")
except Exception as e:
    logger.error(f"Failed to connect to ChromaDB Cloud: {e}")
    collection = None

def index_case(case_id: str, case_summary: str):
    """Index the anonymized summary into ChromaDB."""
    if not collection:
        return
    try:
        collection.upsert(
            documents=[case_summary],
            metadatas=[{"case_id": case_id}],
            ids=[case_id]
        )
        logger.info(f"Case {case_id} indexed in ChromaDB.")
    except Exception as e:
        logger.error(f"Failed to index case in ChromaDB: {e}")

def search_similar_cases(query_text: str, n_results: int = 2) -> list[str]:
    """Search for similar cases and return a formatted string of references."""
    if not collection:
        return []
    try:
        results = collection.query(
            query_texts=[query_text],
            n_results=n_results
        )
        
        references = []
        if results and 'documents' in results and results['documents'] and results['documents'][0]:
            for i, doc in enumerate(results['documents'][0]):
                case_id = results['metadatas'][0][i]['case_id']
                # distance might not be present depending on the chromadb version/setup
                distance = results['distances'][0][i] if 'distances' in results and results['distances'] else 0
                references.append(f"[Historical Case {case_id[:8]}] (Distance: {distance:.2f})\\nSummary: {doc}")
        return references
    except Exception as e:
        logger.error(f"Failed to search ChromaDB: {e}")
        return []
