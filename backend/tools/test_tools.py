from classifier import classify_message
from extractor import extract_indicators
from retrieval import search_guidance

test_msg = "URGENT: Your bank account is blocked. Verify your password immediately at http://fake-bank.com"

print("1. Classifier:", classify_message(test_msg))
print("2. Indicators:", extract_indicators(test_msg))
print("3. Guidance:", [g["title"] for g in search_guidance(extract_indicators(test_msg))])