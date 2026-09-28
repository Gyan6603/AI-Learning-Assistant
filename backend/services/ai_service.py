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
            "num_predict": 3000
        }
    )

    return response["message"]["content"]

def generate_flashcards(document_text: str, count: int = 3) -> str:
    import json

    def generate_batch(batch_count: int) -> list:
        prompt = f"""
You are an accurate AI Learning Assistant.

TASK:
Create exactly {batch_count} educational flashcards from the provided PDF text.

STRICT ACCURACY RULES:

1. Use ONLY information explicitly present in the PDF.
2. Never guess, assume, or invent facts.
3. Do not use outside knowledge.
4. Every answer must be directly supported by the PDF.
5. Questions must be short and specific.
6. Answers must be clear and concise.
7. Use simple, clear English only.
8. Questions and answers must be entirely in English.
9. Do not use Hindi, Hinglish, or any other language.
10. Do not include information that is not mentioned in the PDF.
11. Return exactly {batch_count} flashcards.
12. Return the complete JSON response.
13. Do not stop before completing all flashcards.

OUTPUT FORMAT:

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
                            "required": [
                                "question",
                                "answer"
                            ]
                        }
                    }
                },
                "required": [
                    "flashcards"
                ]
            },
            options={
                "num_predict": 1200
            }
        )

        result = json.loads(
            response["message"]["content"]
        )

        return result["flashcards"]

    # Generate requested number of cards
    all_flashcards = []

    if count <= 5:
        all_flashcards = generate_batch(count)

    else:
        # Generate 5 + remaining cards
        first_batch = generate_batch(5)
        second_batch = generate_batch(count - 5)

        all_flashcards = first_batch + second_batch

    return json.dumps({
        "flashcards": all_flashcards
    })

def generate_quiz(document_text: str) -> str:
    prompt = f"""
You are an accurate AI Learning Assistant.

TASK:
Create exactly 5 multiple-choice questions from the provided PDF text.

RULES:
RULES:
1. Use ONLY information explicitly present in the PDF.
2. Never guess or invent facts.
3. Each question must have exactly 4 options.
4. Every question must have exactly ONE correct answer.
5. Use "single" for every question.
6. Never create multiple-correct-answer questions.
7. The other three options must be incorrect but plausible.
8. Every correct answer must be directly supported by the PDF.
9. Use simple, clear English.
10. Return ONLY valid JSON.
11. Do not add explanations outside JSON.

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

