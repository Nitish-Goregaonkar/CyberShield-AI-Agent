import re

def extract_indicators(text: str):
    """
    Scans the text for common phishing indicators using Regex.
    Returns a list of dictionaries containing the indicator and explanation.
    """
    text_lower = text.lower()
    indicators = []

    # 1. Urgency / Threats
    urgency_patterns = [r"urgent", r"immediately", r"suspend", r"blocked", r"act now", r"warning", r"alert"]
    for pattern in urgency_patterns:
        if re.search(pattern, text_lower):
            indicators.append({
                "type": "urgency",
                "text": pattern,
                "explanation": "Uses pressure or threats to force quick action without thinking."
            })
            break # Only flag once per category

    # 2. Credential / OTP Requests
    cred_patterns = [r"password", r"otp", r"pin", r"verify your account", r"login", r"update your details"]
    for pattern in cred_patterns:
        if re.search(pattern, text_lower):
            indicators.append({
                "type": "credential_request",
                "text": pattern,
                "explanation": "Asks for sensitive information. Legitimate organizations rarely ask for this via text/email."
            })
            break

    # 3. URLs / Links
    # Basic URL regex
    url_pattern = r"(https?://[^\s]+|www\.[^\s]+)"
    urls = re.findall(url_pattern, text_lower)
    if urls:
        indicators.append({
            "type": "suspicious_url",
            "text": urls[0], # Show the first URL found
            "explanation": "Contains a link. Always verify the destination before clicking."
        })

    # 4. Impersonation / Authority
    impersonation_patterns = [r"ceo", r"manager", r"it support", r"microsoft", r"bank", r"hr department"]
    for pattern in impersonation_patterns:
        if re.search(pattern, text_lower):
            indicators.append({
                "type": "impersonation",
                "text": pattern,
                "explanation": "Claims to be from a trusted authority figure or organization."
            })
            break

    return indicators