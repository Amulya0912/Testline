let Questions = [];
let userName = "";
let currQuestion = 0;
let score = 0;
let userAnswers = [];
let timer;
let timeLeft = 10; 

const container = document.getElementById("quiz-container");
const originalContent = container.innerHTML; 


function startQuiz() {
    if (!userName) {
        userName = document.getElementById("username").value.trim();
        if (userName === "") {
            alert("Please enter your name to start the quiz!");
            return;
        }
    }

    document.getElementById("welcome-screen").style.display = "none";
    document.getElementById("quiz-section").style.display = "block";
    fetchQuestions(); 
}
 
//https://opentdb.com/api.php?amount=10
//https://api.jsonserve.com/Uw5CrX
async function fetchQuestions() {
    try {
        const response = await fetch('https://opentdb.com/api.php?amount=10');
        if (!response.ok) {
            throw new Error("Something went wrong! Unable to fetch data.");
        }
        const data = await response.json();
        Questions = data.results;
        userAnswers = new Array(Questions.length).fill(null);
        loadQues(); 
    } catch (error) {
        console.log(error);
        document.getElementById("ques").innerHTML = `<h5 style='color: red'>${error}</h5>`;
    }
}

function decodeHTMLEntities(text) {
    let textArea = document.createElement("textarea");
    textArea.innerHTML = text;
    return textArea.value;
}

function loadQues() {
    if (Questions.length === 0) {
        document.getElementById("ques").innerHTML = `<h5>Loading Questions...</h5>`;
        return;
    }

    const ques = document.getElementById("ques");
    const opt = document.getElementById("opt");
    let currentQuestion = decodeHTMLEntities(Questions[currQuestion].question);
    ques.innerText = currentQuestion;
    opt.innerHTML = "";

    const correctAnswer = decodeHTMLEntities(Questions[currQuestion].correct_answer);
    const incorrectAnswers = Questions[currQuestion].incorrect_answers.map(decodeHTMLEntities);
    const options = [correctAnswer, ...incorrectAnswers];

    
    options.sort(() => Math.random() - 0.5);

    options.forEach((option) => {
        const choicesdiv = document.createElement("div");
        const choice = document.createElement("input");
        const choiceLabel = document.createElement("label");

        choice.type = "radio";
        choice.name = "answer";
        choice.value = option;
        if (userAnswers[currQuestion] === option) {
            choice.checked = true;
        }

        choiceLabel.textContent = option;
        choicesdiv.appendChild(choice);
        choicesdiv.appendChild(choiceLabel);
        opt.appendChild(choicesdiv);
    });

    
    document.getElementById("next-btn").innerText = currQuestion === Questions.length - 1 ? "Submit" : "Next";
    document.getElementById("next-btn").style.display = "block";
    updateProgressBar();
    resetTimer();
}

function updateProgressBar() {
    const progressBar = document.getElementById("progress-bar");
    const progress = ((currQuestion + 1) / Questions.length) * 100;
    progressBar.style.width = progress + '%';
}

function resetTimer() {
    timeLeft = 10;
    document.getElementById("time").textContent = timeLeft;
    clearInterval(timer);
    timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
    timeLeft--;
    document.getElementById("time").textContent = timeLeft;
    if (timeLeft <= 0) {
        clearInterval(timer);
        alert("Time's up! Ending quiz.");
        calculateScore();
        loadScore();
        document.getElementById("quiz-section").remove();
    }
}

function checkAns() {
    const selectedAns = document.querySelector('input[name="answer"]:checked');
    if (!selectedAns) {
        alert("Please select an answer before proceeding!");
        return false;
    }
    userAnswers[currQuestion] = selectedAns.value;
    return true;
}

function nextQuestion() {
    if (!checkAns()) return; 

    if (currQuestion < Questions.length - 1) {
        currQuestion++;
        loadQues();
    } else {
        calculateScore();
        loadScore();
        document.getElementById("quiz-section").remove();
    }
}

function calculateScore() {
    score = userAnswers.reduce((acc, ans, index) => {
        return ans === Questions[index].correct_answer ? acc + 1 : acc;
    }, 0);
}

function loadScore() {
    container.innerHTML = `
        <h2>Quiz Completed!</h2>
        <h3>${userName}, you scored ${score} out of ${Questions.length}</h3>
        <h3>Correct Answers:</h3>
        <ul>${Questions.map((el, index) => `<li>${index + 1}. ${decodeHTMLEntities(el.correct_answer)}</li>`).join('')}</ul>
        <button onclick="resetQuiz()">Restart Quiz</button>
    `;
}
function resetQuiz() {
    currQuestion = 0;
    score = 0;
    userAnswers = new Array(Questions.length).fill(null);
    container.innerHTML = originalContent;
    fetchQuestions();
}
