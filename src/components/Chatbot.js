import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useChatState, useChatDispatch } from '../context/ChatContext';
import { motion } from 'framer-motion';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

const Chatbot = () => {
  const { messages } = useChatState();
  const dispatch = useChatDispatch();
  const [input, setInput] = useState('');

  useEffect(() => {
    socket.on('message', message => {
      dispatch({ type: 'ADD_MESSAGE', payload: { sender: 'bot', text: message } });
    });
    return () => socket.off('message');
  }, [dispatch]);

  const sendMessage = useCallback(async () => {
    const userMessage = { sender: 'user', text: input };
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });

    try {
      const response = await axios.post('http://localhost:4000/chat', { message: input });
      dispatch({ type: 'ADD_MESSAGE', payload: { sender: 'bot', text: response.data.reply } });
      setInput('');
    } catch (error) {
      dispatch({ type: 'ADD_MESSAGE', payload: { sender: 'bot', text: 'There was an error processing your request. Please try again.' } });
    }
  }, [input, dispatch]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow p-4 overflow-auto bg-gray-100">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`my-2 p-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}
          >
            <span className={`inline-block px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-gray-300 text-black'}`}>
              {msg.text}
            </span>
          </motion.div>
        ))}
      </div>
      <div className="flex p-4 bg-gray-200">
        <input
          className="flex-grow p-2 border border-gray-300 rounded-md"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="ml-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-accent transition duration-300" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
