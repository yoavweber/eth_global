Template Prompt (for internal agent processing)

Below is a user's description of their team trip. 
Your task is to:
1. Parse the request.
2. Classify all constraints (HARD, SOFT, COMMONSENSE).
3. Extract structured travel requirements using the JSON schema.
4. Prepare reasoning (chain-of-thought internally).
5. Prepare ranked recommendations (JSON only).

Do NOT query external booking APIs yet.
This step is ONLY requirements parsing and logical preparation.

User Request:
"""
{{USER_MESSAGE}}
"""

Your Output:
- Valid JSON following the defined schema.
- No prose outside JSON.
