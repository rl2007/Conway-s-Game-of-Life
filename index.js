// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const gameOfLifeRouter = require('./gameOfLifeRouter');

// Create an Express application
const app = express();

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Use body-parser to parse JSON bodies
app.use(bodyParser.json());

// Define the port number, defaulting to 3001 if not specified in environment variables
const PORT = process.env.PORT || 3001;

// Use the Game of Life router for any requests to '/game'
app.use('/game', gameOfLifeRouter);

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
