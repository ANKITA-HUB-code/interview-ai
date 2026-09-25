# InterviewAI

## AI-Based Interview Preparation and Evaluation System Using Generative AI and Prompt Engineering

InterviewAI is a web-based Generative AI application designed to help students practice technical interviews.

## Features

- Role-based interview preparation
- Difficulty selection
- AI-generated interview questions
- AI-based answer evaluation
- Score out of 10
- Strength identification
- Improvement suggestions
- Suggested interview-ready answer
- Interview performance summary

## Technology Stack

- HTML
- CSS
- JavaScript
- Gemini Generative AI API
- Vercel Serverless Functions

## How It Works

1. User selects a target role.
2. User selects interview difficulty.
3. Gemini generates an interview question.
4. User submits an answer.
5. Gemini evaluates the answer using a structured evaluation prompt.
6. The system displays score and personalized feedback.
7. User can continue with additional questions.

## Prompt Engineering

The application uses structured prompts to control:
- Interview question generation
- Difficulty
- Role relevance
- Answer evaluation criteria
- JSON-formatted evaluation output

## Security

The Gemini API key is stored as a server-side environment variable and is not included in the frontend source code.

## Author

Ankita Nandi