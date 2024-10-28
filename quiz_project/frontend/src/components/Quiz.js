// src/components/Quiz.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Quiz.css';

function QuizLandingPage() {
    const [username, setUsername] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchUserData() {
            try {
                const response = await fetch('http://127.0.0.1:8000/quiz/api/check-login/', {
                    credentials: 'include',
                });
                const data = await response.json();
                if (data.isLoggedIn) {
                    setUsername(data.username);

                    // Check if the user is an admin
                    const adminResponse = await fetch('http://127.0.0.1:8000/quiz/api/check-admin/', {
                        credentials: 'include',
                    });
                    const adminData = await adminResponse.json();
                    setIsAdmin(adminData.is_admin);
                } else {
                    navigate('/accounts/login');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        }
        fetchUserData();
    }, [navigate]);

    const handleStartQuiz = () => {
        navigate('/quiz/start');
    };

    const handleLogout = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/quiz/api/logout/', {
                method: 'POST',
                credentials: 'include',
            });
            if (response.ok) {
                navigate('/accounts/login');
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <div className="quiz-container">
            <h1>Online Quiz</h1>
            <p>Hello, {username}</p>
            <button onClick={handleStartQuiz}>Start Quiz</button>
            <button onClick={() => navigate('/quiz/gift')}>Gift Points</button>
            {isAdmin && (
                <button onClick={() => window.location.href = '/admin/'}>
                    Manage Quiz
                </button>
            )}
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default QuizLandingPage;
