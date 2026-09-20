import ollama


def generate_ai_response(
    message: str,
    document_text: str | None = None
) -> str:

    if document_text:
        prompt = f"""
You are an AI Learning Assistant.

IMPORTANT INSTRUCTIONS:
- The document text below is extracted from the user's PDF.
- Use this text to answer the user's question.
- Do not say that you cannot see or access the PDF.
- Do not ask the user to upload the PDF again.
- If the answer is not present in the document, clearly say:
  "This information is not available in the selected PDF."
- Explain the answer in simple language with examples when useful.

===== START OF PDF CONTENT =====

{document_text}

===== END OF PDF CONTENT =====

===== USER QUESTION =====

{message}

===== YOUR ANSWER =====
"""

    else:
        prompt = f"""
You are an AI Learning Assistant.

Answer the following question clearly and simply:

{message}
"""

    response = ollama.chat(
        model="llama3.2:3b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        options={
            "num_predict": 300
        }
    )

    return response["message"]["content"]

def generate_flashcards(document_text: str) -> str:

    prompt = f"""
You are an accurate AI Learning Assistant.

TASK:
Create exactly 3 educational flashcards from the provided PDF text.

STRICT ACCURACY RULES:
1. Use ONLY information explicitly present in the PDF.
2. Never guess, assume, or invent facts.
3. Do not use outside knowledge.
4. Every answer must be directly supported by the PDF.
5. If the PDF does not contain enough information, create fewer flashcards.
6. Questions must be short and specific.
7. Answers must be clear and concise.
8. Use simple Hinglish.
9. Do not include information that is not mentioned in the PDF.

OUTPUT FORMAT:
Return ONLY valid JSON in this format:
{{
  "flashcards": [
    {{
      "question": "Question here",
      "answer": "Answer here"
    }}
  ]
}}

PDF TEXT:
{document_text[:4000]}
"""

    response = ollama.chat(
        model="llama3.2:3b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        format={
            "type": "object",
            "properties": {
                "flashcards": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "question": {
                                "type": "string"
                            },
                            "answer": {
                                "type": "string"
                            }
                        },
                        "required": ["question", "answer"]
                    }
                }
            },
            "required": ["flashcards"]
        },
        options={
            "num_predict": 300
        }
    )

    return response["message"]["content"]


def generate_quiz(document_text: str) -> str:
    prompt = f"""
You are an accurate AI Learning Assistant.

TASK:
Create exactly 5 multiple-choice questions from the provided PDF text.

RULES:
1. Use ONLY information explicitly present in the PDF.
2. Never guess or invent facts.
3. Each question must have exactly 4 options.
4. Use "single" when exactly one option is correct.
5. Use "multiple" only when more than one option is correct.
6. For multiple questions, include all correct options.
7. Every correct answer must be supported by the PDF.
8. Use simple, clear English.
9. Return ONLY valid JSON.
10. Do not add explanations outside JSON.

OUTPUT FORMAT:
{{
  "quiz": [
    {{
      "question": "Question here",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "question_type": "single",
      "correct_answers": [
        "Option A"
      ]
    }}
  ]
}}

PDF TEXT:
{document_text[:4000]}
"""

    response = ollama.chat(
        model="llama3.2:3b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        format={
            "type": "object",
            "properties": {
                "quiz": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "question": {
                                "type": "string"
                            },
                            "options": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                }
                            },
                            "question_type": {
                                "type": "string",
                                "enum": [
                                    "single",
                                    "multiple"
                                ]
                            },
                            "correct_answers": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                }
                            }
                        },
                        "required": [
                            "question",
                            "options",
                            "question_type",
                            "correct_answers"
                        ]
                    }
                }
            },
            "required": [
                "quiz"
            ]
        },
        options={
            "num_predict": 1500
        }
    )

    return response["message"]["content"]

