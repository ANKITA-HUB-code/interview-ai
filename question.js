export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        const {
            role,
            difficulty,
            previousQuestion
        } = req.body;

        const prompt = `
You are an expert technical interviewer.

Generate ONE interview question for the following candidate:

Role: ${role}
Difficulty: ${difficulty}

${previousQuestion
    ? `The previous question was: "${previousQuestion}". Generate a different question.`
    : ""
}

Rules:
- Ask exactly one question.
- Keep it relevant to the selected role.
- Do not provide the answer.
- Do not add explanations.
- Return only the interview question.
`;

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": process.env.GEMINI_API_KEY
                },

                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            return res.status(response.status).json({
                error: data.error?.message || "Gemini API error"
            });

        }

        const question =
            data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!question) {

            return res.status(500).json({
                error: "No question generated"
            });

        }

        return res.status(200).json({
            question: question.trim()
        });

    } catch (error) {

        return res.status(500).json({
            error: error.message
        });

    }
}