// src/components/QuizStart.js
import React, { useState, useEffect } from 'react';
import './QuizStart.css';

function QuizStart({ username }) {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showScore, setShowScore] = useState(false);
    const [totalScore, setTotalScore] = useState(0);
    const [showHelpPopup, setShowHelpPopup] = useState(false);
    const [recipient, setRecipient] = useState('');
    const [users, setUsers] = useState([]);

    useEffect(() => {
        async function fetchQuestions() {
            try {
                const response = await fetch('http://127.0.0.1:8000/quiz/api/quiz-data/');
                const data = await response.json();
                setQuestions(data.questions);
            } catch (error) {
                console.error('Error fetching questions:', error);
            }
        }

        async function fetchTotalScore() {
            try {
                const response = await fetch('http://127.0.0.1:8000/quiz/api/total-score/', {
                    credentials: 'include'
                });
                const data = await response.json();
                setTotalScore(data.total_score);
            } catch (error) {
                console.error('Error fetching total score:', error);
            }
        }

        async function fetchUsers() {
            try {
                const response = await fetch('http://127.0.0.1:8000/quiz/api/users/', { credentials: 'include' });
                const data = await response.json();
                setUsers(data.users.filter(user => user !== username));
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        }

        fetchQuestions();
        fetchTotalScore();
        fetchUsers();
    }, [username]);

    async function handleQuizCompletion() {
        try {
            const response = await fetch('http://127.0.0.1:8000/quiz/api/update-total-score/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ quiz_score: score }),
            });
            const data = await response.json();
            setTotalScore(data.total_score);
        } catch (error) {
            console.error('Error updating total score:', error);
        }
    }

    function handleAnswer(isCorrect) {
        if (isCorrect) setScore(prevScore => prevScore + 1);

        const nextQuestion = currentQuestionIndex + 1;
        if (nextQuestion < questions.length) {
            setCurrentQuestionIndex(nextQuestion);
        } else {
            setShowScore(true);
            handleQuizCompletion();
        }
    }

    function handleRestartQuiz() {
        setScore(0);
        setCurrentQuestionIndex(0);
        setShowScore(false);
    }

    function prepareEmailContent() {
        const question = questions[currentQuestionIndex];
        const answers = question.answers.map((answer, index) => `Option ${index + 1}: ${answer.text}`).join("\n");

        return `mailto:${recipient}?subject=Quiz Help Needed&body=Hi, I need help with the following question:\n\n${question.text}\n\n${answers}`;
    }

    if (!questions.length) return <div>Loading questions...</div>;

    return (
        <div className='quiz-start-container'>
            <h2>Quiz Time!</h2>
            {showScore ? (
                <div>
                    <h3>Well done, {username}!</h3>
                    <p>Your Score: {score} / {questions.length}</p>
                    <p>Total Score: {totalScore}</p>
                    <button onClick={handleRestartQuiz}>Restart Quiz</button>
                    <button onClick={() => window.location.href = '/quiz/'}>Return to Quiz Home</button>
                </div>
            ) : (
                <div>
                    <h3>Question {currentQuestionIndex + 1}</h3>
                    <p>{questions[currentQuestionIndex].text}</p>
                    {questions[currentQuestionIndex].answers.map((answer) => (
                        <button key={answer.id} onClick={() => handleAnswer(answer.is_correct)}>
                            {answer.text}
                        </button>
                    ))}
                    <button onClick={() => setShowHelpPopup(true)}>Message for Help</button>
                    <button onClick={() => window.location.href = '/quiz/'}>Return to Quiz Home</button>
                </div>
            )}

            {/* Help Popup */}
            {showHelpPopup && (
                <div className="help-popup">
                    <h3>Contact a User for Help</h3>
                    <label>
                        Select Recipient:
                        <select value={recipient} onChange={(e) => setRecipient(e.target.value)}>
                            <option value="">--Select--</option>
                            {users.map((user) => (
                                <option key={user} value={user}>{user}</option>
                            ))}
                        </select>
                    </label>
                    <button 
                        onClick={() => {
                            window.location.href = prepareEmailContent();
                            setShowHelpPopup(false); 
                        }}
                        disabled={!recipient}  
                    >
                        Send Email
                    </button>
                    <button onClick={() => setShowHelpPopup(false)}>Cancel</button>
                </div>
            )}
        </div>
    );
}

export default QuizStart;
