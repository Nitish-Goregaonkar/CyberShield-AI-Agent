import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KB_PATH = os.path.join(os.path.dirname(BASE_DIR), "data", "knowledge_base", "kb_entries.json")

# Load KB globally
try:
    with open(KB_PATH, 'r', encoding='utf-8') as f:
        knowledge_base = json.load(f)
    print("Knowledge Base loaded successfully.")
except Exception as e:
    print(f"Error loading Knowledge Base: {e}")
    knowledge_base = []

def search_guidance(indicators: list):
    """
    Matches extracted indicators with the knowledge base.
    """
    matched_guidance = []
    tags_found = set()

    for ind in indicators:
        tags_found.add(ind["type"])

    for entry in knowledge_base:
        # If the entry has a tag that matches our found indicators, retrieve it
        if any(tag in entry.get("indicator_tags", []) for tag in tags_found):
            matched_guidance.append(entry)

    # If no indicators matched but we need guidance, return general response
    if not matched_guidance and len(indicators) > 0:
        # Just return the first entry as a fallback
        matched_guidance.append(knowledge_base[0])

    return matched_guidance