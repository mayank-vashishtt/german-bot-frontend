import React, { useState, useEffect, useRef } from 'react';
import "./ChatPage.css";
import ChatHeader from './ChatHeader';
import ReactMarkdown from 'react-markdown';

const USER_ID = 'demo-user'; // In production, generate or fetch a real userId

const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // On mount, fetch the first question
    useEffect(() => {
        const fetchFirstQuestion = async () => {
            setIsTyping(true);
            try {
                const response = await fetch('https://german-bot-backend.onrender.com/api/ask', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: USER_ID })
                });
                const data = await response.json();
                setIsTyping(false);
                setMessages([{ user: 'Teacher', text: data.response }]);
            } catch (error) {
                setIsTyping(false);
                setMessages([{ user: 'System', text: 'Fehler beim Laden der ersten Frage.' }]);
            }
        };
        fetchFirstQuestion();
    }, []);

    const handleSend = async () => {
        if (input.trim() !== '') {
            setMessages(prev => [...prev, { user: 'User', text: input }]);
            setInput('');
            setIsTyping(true);

            try {
                const response = await fetch('http://localhost:3001/api/ask', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: USER_ID, answer: input })
                });
                const data = await response.json();
                setIsTyping(false);

                // Show feedback if present
                if (data.feedback) {
                    setMessages(prev => [
                        ...prev,
                        { user: 'Teacher', text: data.feedback }
                    ]);
                }
                // Show next question or end message
                if (data.response) {
                    setMessages(prev => [
                        ...prev,
                        { user: 'Teacher', text: data.response }
                    ]);
                }
            } catch (error) {
                setIsTyping(false);
                setMessages(prev => [
                    ...prev,
                    { user: 'System', text: 'Fehler bei der Verarbeitung deiner Antwort.' }
                ]);
            }
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSend();
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    return (
        <div className="chat-container">
            <ChatHeader />
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.user}`}>
                        <div className="message-content">
                            {msg.user === 'Teacher' ? (
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            ) : (
                                <div>{msg.text}</div>
                            )}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="chat-message Teacher typing">
                        <div className="message-content">
                            <span className="dot"></span>
                            <span className="dot"></span>
                            <span className="dot"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="chat-input">
                <input 
                    type="text" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    onKeyDown={handleKeyDown} 
                    placeholder="Antworte auf Deutsch..." 
                />
                <button onClick={handleSend}>Senden</button>
            </div>
        </div>
    );
};

export default ChatPage;