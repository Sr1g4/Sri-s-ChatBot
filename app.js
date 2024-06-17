require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const port = 4000;

app.use(bodyParser.json());
app.use(cors());

const OPENAI_API_KEY ='sk-proj-Su0RI8MoHZasFJ9Y1Um6T3BlbkFJdl3mMMk6R5bDWJXAD72R'
const WEATHER_API_KEY = 'fc06f6f9c3999563b04dedc50665d11d';
const GEOLOCATION_API_KEY = 'c2322f7dc148bd9d034f007e689e30da';

let conversationHistory = [];

const addToMemory = (role, content) => {
  conversationHistory.push({ role, content });
};

const getConversationHistory = () => conversationHistory;

const revertToCheckpoint = (checkpointIndex) => {
  conversationHistory = conversationHistory.slice(0, checkpointIndex);
};

const getServerGeolocation = async () => {
  try {
    const response = await axios.get(`http://api.ipapi.com/api/check?access_key=${GEOLOCATION_API_KEY}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching geolocation data:', error);
    return null;
  }
};

const getWeatherData = async (lat, lon) => {
  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
};

app.post('/chat', async (req, res) => {
  const { message, revertTo } = req.body;

  if (revertTo !== undefined) {
    revertToCheckpoint(revertTo);
    return res.json({ message: `Reverted to checkpoint ${revertTo}.` });
  }

  try {
    let weatherData = null;

    if (message.toLowerCase().includes("weather")) {
      const geolocationData = await getServerGeolocation();
      if (geolocationData) {
        const { latitude, longitude } = geolocationData;
        weatherData = await getWeatherData(latitude, longitude);
      }
    }

    addToMemory('user', message);

    const openAiMessage = {
      role: 'user',
      content: weatherData ? `The current weather is: ${JSON.stringify(weatherData)}` : message,
    };
    addToMemory('user', openAiMessage.content);

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: getConversationHistory(),
      max_tokens: 150,
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const assistantResponse = response.data.choices[0].message.content.trim();
    addToMemory('assistant', assistantResponse);

    res.json({ reply: assistantResponse });
  } catch (error) {
    console.error('Error in /chat:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
    }
    res.status(500).json({ error: 'There was an error processing your request. Please try again.' });
  }
});

app.post('/recommend', async (req, res) => {
  const { query } = req.body;
  console.log('Received /recommend request:', query);

  try {
    const response = await axios.get(`http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&s=${query}`);
    if (response.data.Response === "True") {
      res.json({ movies: response.data.Search });
    } else {
      res.status(404).json({ error: response.data.Error });
    }
  } catch (error) {
    console.error('Error in /recommend:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
    }
    res.status(500).json({ error: 'There was an error processing your request. Please try again.' });
  }
});

const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

module.exports = app;
