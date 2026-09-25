let currentQuestion = "";
let questionCount = 0;
let totalScore = 0;
let evaluatedAnswers = 0;

async function startInterview() {

    const role = document.getElementById("role").value;
    const difficulty = document.getElementById("difficulty").value;

    document.getElementById("setupStatus").textContent =
        "Generating your first AI interview question...";

    try {

        const response = await fetch("/api/question", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                role,
                difficulty
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to generate question");
        }

        currentQuestion = data.question;

        questionCount = 1;

        document.getElementById("setupSection").classList.add("hidden");
        document.getElementById("interviewSection").classList.remove("hidden");

        document.getElementById("roleDisplay").textContent =
            role + " • " + difficulty;

        displayQuestion();

    } catch (error) {

        document.getElementById("setupStatus").textContent =
            "Error: " + error.message;

    }
}


function displayQuestion() {

    document.getElementById("questionNumber").textContent =
        "Question " + questionCount;

    document.getElementById("questionText").textContent =
        currentQuestion;

    document.getElementById("answer").value = "";

    document.getElementById("answerStatus").textContent = "";

    document.getElementById("feedbackBox").classList.add("hidden");
}


async function evaluateAnswer() {

    const answer = document.getElementById("answer").value.trim();

    if (!answer) {

        document.getElementById("answerStatus").textContent =
            "Please enter an answer before evaluating.";

        return;
    }

    const role = document.getElementById("role").value;

    document.getElementById("answerStatus").textContent =
        "AI is evaluating your answer...";

    try {

        const response = await fetch("/api/evaluate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                role,
                question: currentQuestion,
                answer
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Evaluation failed");
        }

        showFeedback(data);

        totalScore += Number(data.score);
        evaluatedAnswers++;

        document.getElementById("answerStatus").textContent = "";

    } catch (error) {

        document.getElementById("answerStatus").textContent =
            "Error: " + error.message;

    }
}


function showFeedback(data) {

    document.getElementById("feedbackBox").classList.remove("hidden");

    document.getElementById("score").textContent = data.score;

    document.getElementById("overallFeedback").textContent =
        data.overallFeedback;

    const strengths = document.getElementById("strengths");

    strengths.innerHTML = "";

    data.strengths.forEach(item => {

        const li = document.createElement("li");

        li.textContent = item;

        strengths.appendChild(li);

    });


    const improvements = document.getElementById("improvements");

    improvements.innerHTML = "";

    data.improvements.forEach(item => {

        const li = document.createElement("li");

        li.textContent = item;

        improvements.appendChild(li);

    });


    document.getElementById("suggestedAnswer").textContent =
        data.suggestedAnswer;
}


async function nextQuestion() {

    const role = document.getElementById("role").value;
    const difficulty = document.getElementById("difficulty").value;

    document.getElementById("answerStatus").textContent =
        "Generating next question...";

    try {

        const response = await fetch("/api/question", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                role,
                difficulty,
                previousQuestion: currentQuestion
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to generate question");
        }

        currentQuestion = data.question;

        questionCount++;

        displayQuestion();

    } catch (error) {

        document.getElementById("answerStatus").textContent =
            "Error: " + error.message;

    }
}


function skipQuestion() {

    if (questionCount >= 5) {

        finishInterview();

        return;
    }

    questionCount++;

    nextQuestion();
}


function finishInterview() {

    document.getElementById("interviewSection").classList.add("hidden");

    document.getElementById("summarySection").classList.remove("hidden");

    const average =
        evaluatedAnswers === 0
            ? 0
            : (totalScore / evaluatedAnswers).toFixed(1);

    document.getElementById("finalScore").textContent = average;

    document.getElementById("summaryText").textContent =
        `You evaluated ${evaluatedAnswers} answer(s). Your average score was ${average}/10. Continue practicing to improve your technical clarity, completeness and interview communication.`;
}