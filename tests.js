const request = require('supertest');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
jest.mock('axios');

// Import the server from your app file
const app = require('./app'); // Ensure your app exports the Express instance

app.use(bodyParser.json());
app.use(cors());

describe('Chatbot API', () => {
  describe('POST /chat', () => {
    it('should respond with a message from OpenAI', async () => {
      axios.post.mockResolvedValue({
        data: {
          choices: [
            { message: { content: 'Hello, how can I assist you today?' } }
          ]
        }
      });

      const response = await request(app)
        .post('/chat')
        .send({ message: 'Hi' });

      expect(response.status).toBe(200);
      expect(response.body.reply).toBe('Hello, how can I assist you today?');
    });

    it('should revert to a specified checkpoint', async () => {
      const response = await request(app)
        .post('/chat')
        .send({ message: 'Revert to checkpoint', revertTo: 0 });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Reverted to checkpoint 0.');
    });
  });

  describe('POST /recommend', () => {
    it('should respond with a list of movies from OMDB', async () => {
      axios.get.mockResolvedValue({
        data: {
          Response: 'True',
          Search: [
            { Title: 'Inception', Year: '2010', imdbID: 'tt1375666', Type: 'movie', Poster: 'N/A' }
          ]
        }
      });

      const response = await request(app)
        .post('/recommend')
        .send({ query: 'Inception' });

      expect(response.status).toBe(200);
      expect(response.body.movies).toEqual([
        { Title: 'Inception', Year: '2010', imdbID: 'tt1375666', Type: 'movie', Poster: 'N/A' }
      ]);
    });

    it('should respond with an error if no movies are found', async () => {
      axios.get.mockResolvedValue({
        data: {
          Response: 'False',
          Error: 'Movie not found!'
        }
      });

      const response = await request(app)
        .post('/recommend')
        .send({ query: 'Nonexistent Movie' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Movie not found!');
    });
  });
});
