export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        const {
            role,
            question,
            answer
        } = req.body;

        if (!answer || answer.trim().length < 5) {

            return res.status(400).json({
                error: "Answer is too short to evaluate."
            });

        }

        const prompt = `
You are an expert technical interviewer evaluating a candidate.

Candidate Role:
${role}

Interview Question:
${question}

Candidate Answer:
${answer}

Evaluate the answer using the following criteria:
1. Technical correctness
2. Completeness
3. Clarity
4. Relevance

Give a score from 0 to 10.

Return ONLY valid JSON in exactly this structure:

{
  "score": 0,
  "overallFeedback": "short feedback",
  "strengths": [
    "strength 1",
    "strength 2"
  ],
  "improvements": [
    "improvement 1",
    "improvement 2"
  ],
  "suggestedAnswer": "a concise interview-ready answer"
}

Do not use markdown.
Do not add text outside the JSON.
`;

        // Retry temporary Gemini capacity errors automatically
        let response;
        let data;

        for (let attempt = 1; attempt <= 3; attempt++) {

            response = await fetch(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
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
                        ],
                        generationConfig: {
                            responseMimeType: "application/json"
                        }
                    })
                }
            );

            data = await response.json();

            // Success
            if (response.ok) {
                break;
            }

            // Retry only temporary capacity/rate-limit errors
            if (response.status === 429 || response.status === 503) {

                if (attempt < 3) {
                    await new Promise(resolve =>
                        setTimeout(resolve, 1500 * attempt)
                    );
                    continue;
                }
            }

            return res.status(response.status).json({
                error: data.error?.message || "Gemini API error"
            });
        }

        const text =
            data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {

            return res.status(500).json({
                error: "No evaluation generated"
            });

        }

        const result = JSON.parse(text);

        return res.status(200).json(result);

    } catch (error) {

        return res.status(500).json({
            error: error.message
        });

    }
}
