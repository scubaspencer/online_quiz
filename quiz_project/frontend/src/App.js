// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import QuizLandingPage from './components/Quiz';
import QuizStart from './components/QuizStart';
import GiftPoints from './components/GiftPoints';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [totalScore, setTotalScore] = useState(0); // Initialize totalScore state

    useEffect(() => {
        async function checkLoginStatus() {
            try {
                const response = await fetch('http://127.0.0.1:8000/quiz/api/check-login/', {
                    credentials: 'include',
                });
                const data = await response.json();
                if (data.isLoggedIn) {
                    setIsLoggedIn(true);
                    fetchTotalScore(); // Fetch totalScore if logged in
                } else {
                    window.location.href = 'http://127.0.0.1:8000/accounts/login/?next=/quiz/';
                }
            } catch (error) {
                console.error('Error checking login status:', error);
            } finally {
                setLoading(false);
            }
        }
        checkLoginStatus();
    }, []);

    async function fetchTotalScore() {
        try {
            const response = await fetch('http://127.0.0.1:8000/quiz/api/total-score/', {
                credentials: 'include',
            });
            const data = await response.json();
            setTotalScore(data.total_score);
        } catch (error) {
            console.error('Error fetching total score:', error);
        }
    }

    if (loading) {
        return <div className="App"><p>Loading...</p></div>;
    }

    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Navigate to="/quiz" />} />
                    <Route path="/quiz" element={isLoggedIn ? <QuizLandingPage /> : <Navigate to="/" />} />
                    <Route path="/quiz/start" element={isLoggedIn ? <QuizStart username="User" /> : <Navigate to="/" />} />
                    <Route 
                        path="/quiz/gift" 
                        element={isLoggedIn ? <GiftPoints totalScore={totalScore} setTotalScore={setTotalScore} /> : <Navigate to="/" />} 
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
