import React, { useState, useEffect } from 'react';
import Chatbot from './components/Chatbot';
import Settings from './components/Settings';
import { ChatProvider } from './context/ChatContext';
import './App.css';

function App() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return (
    <ChatProvider>
      <div className="App">
        <header className="App-header">
          <h1 className="text-4xl font-bold mb-4">Futuristic Chatbot</h1>
          <button
            onClick={toggleTheme}
            className="p-2 bg-primary rounded-lg hover:bg-accent transition duration-300"
          >
            Toggle theme
          </button>
        </header>
        <div className="flex flex-col lg:flex-row min-h-screen">
          <div className="flex-grow">
            <Chatbot />
          </div>
          <div className="w-full lg:w-1/4 bg-bg-dark text-text-light p-4">
            <Settings />
          </div>
        </div>
      </div>
    </ChatProvider>
  );
}

export default App;