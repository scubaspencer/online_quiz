// src/components/GiftPoints.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './GiftPoints.css';

function GiftPoints({ totalScore, setTotalScore }) {
    const [recipient, setRecipient] = useState('');
    const [points, setPoints] = useState(0);
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await fetch('http://127.0.0.1:8000/quiz/api/users/', { credentials: 'include' });
                const data = await response.json();
                setUsers(data.users.filter(user => user !== recipient)); // Exclude current user
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        }
        fetchUsers();
    }, [recipient]);

    async function handleGiftPoints() {
        // Ensure recipient and points are valid before proceeding
        if (!recipient || points <= 0 || points > totalScore) {
            console.error('Invalid recipient or points amount');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/quiz/api/gift-points/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ recipient, points })
            });
            const data = await response.json();
            if (data.message) {
                setTotalScore(data.total_score); // Update sender's total score
                navigate('/quiz'); // Redirect to quiz page
            } else {
                console.error(data.error);
            }
        } catch (error) {
            console.error('Error gifting points:', error);
        }
    }

    function handleReturn() {
        navigate('/quiz'); // Navigate back to Quiz page
    }

    return (
        <div className='gift-points-container'>
            <h2>Gift Points</h2>
            <label>
                Select Recipient:
                <select value={recipient} onChange={(e) => setRecipient(e.target.value)}>
                    <option value="">--Select--</option>
                    {users.map((user) => (
                        <option key={user} value={user}>{user}</option>
                    ))}
                </select>
            </label>
            <label>
                Points to Gift:
                <input 
                    type="number" 
                    value={points} 
                    onChange={(e) => setPoints(Math.min(Number(e.target.value), totalScore))} // Cap points to totalScore
                />
            </label>
            <button onClick={handleGiftPoints}>Gift Points</button>
            <button onClick={handleReturn}>Return</button> {/* New return button */}
        </div>
    );
}

export default GiftPoints;
