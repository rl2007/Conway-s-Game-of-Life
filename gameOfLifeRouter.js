const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const GameOfLife = require('./gameOfLife');

const gameOfLifeRouter = express.Router();

// Middleware to parse JSON bodies
gameOfLifeRouter.use(express.json());

// Route to initialize the Game of Life board
gameOfLifeRouter.post('/initialize', (req, res) => {
  const { rows, cols, liveCells } = req.body;

  // Validate input
  if (rows < 1 || cols < 1) {
    return res.status(400).send('cols and rows must be bigger than one');
  }
  if (!Array.isArray(liveCells)) {
    return res.status(400).send('liveCells must be an array');
  }

  // Initialize the game and set the initial state
  const game = new GameOfLife(rows, cols);
  game.initializeBoard(liveCells);
  res.status(200).json(game.getBoardState());
});

// Route to retrieve the current board state after a number of generations
gameOfLifeRouter.post('/state', (req, res) => {
  const { rows, cols, liveCells, generations } = req.body;

  // Validate input
  if (rows < 1 || cols < 1) {
    return res.status(400).send('cols and rows must be bigger than one');
  }
  if (!Array.isArray(liveCells)) {
    return res.status(400).send('liveCells must be an array');
  }

  // Initialize the game and compute the state after the given generations
  const game = new GameOfLife(rows, cols);
  game.initializeBoard(liveCells);

  for (let i = 0; i < (generations || 0); i++) {
    game.getNextGeneration();
  }

  res.status(200).json(game.getBoardState());
});

// Route to evolve the board by one generation
gameOfLifeRouter.post('/evolve', (req, res) => {
  const { rows, cols, liveCells } = req.body;

  // Validate input
  if (rows < 1 || cols < 1) {
    return res.status(400).send('cols and rows must be bigger than one');
  }
  if (!Array.isArray(liveCells)) {
    return res.status(400).send('liveCells must be an array');
  }

  // Initialize the game and evolve the state by one generation
  const game = new GameOfLife(rows, cols);
  game.initializeBoard(liveCells);
  game.getNextGeneration();

  res.status(200).json(game.getBoardState());
});

// Route to save the game state to a file
gameOfLifeRouter.post('/save/:id', async (req, res) => {
  const { id } = req.params;
  const { rows, cols, liveCells } = req.body;

  try {
    // Validate input
    if (rows < 1 || cols < 1) {
      return res.status(400).send('cols and rows must be bigger than one');
    }
    if (!Array.isArray(liveCells)) {
      return res.status(400).send('liveCells must be an array');
    }

    // Initialize the game and save the state to a file
    const game = new GameOfLife(rows, cols);
    game.initializeBoard(liveCells);
    const gameState = game.getBoardState();
    gameState.dateTime = Date.now();

    // Ensure the save directory exists
    const folderPath = path.join(__dirname, '..', 'gameState');
    await fs.mkdir(folderPath, { recursive: true });

    // Write the game state to a file
    const filePath = path.join(folderPath, `gameState_${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(gameState));

    res.status(201).json({ message: 'Game state saved successfully' });
  } catch (err) {
    console.error('Failed to save game state:', err);
    res.status(500).json({ message: 'Failed to save game state' });
  }
});

// Route to load the game state from a file
gameOfLifeRouter.get('/load/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Ensure the save directory exists
    const folderPath = path.join(__dirname, '..', 'gameState');
    await fs.mkdir(folderPath, { recursive: true });

    // Read the game state from the file
    const filePath = path.join(folderPath, `gameState_${id}.json`);
    const data = await fs.readFile(filePath, 'utf8');
    const gameState = JSON.parse(data);

    res
      .status(200)
      .json({ message: 'Game state loaded successfully', state: gameState });
  } catch (err) {
    console.error('Failed to load game state:', err);
    res.status(500).json({ message: 'Failed to load game state' });
  }
});

// Route to get all saved games
gameOfLifeRouter.get('/all', async (req, res) => {
  try {
    const folderPath = path.join(__dirname, '..', 'gameState');
    const files = await fs.readdir(folderPath);
    const games = [];

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const fileData = await fs.readFile(filePath, 'utf-8');
      const gameState = JSON.parse(fileData);

      // Extract the game ID and date from the JSON file
      const id = file.replace('gameState_', '').replace('.json', '');
      const dateTime = gameState.dateTime;

      games.push({ id, dateTime });
    }

    res.status(200).json(games);
  } catch (err) {
    console.error('Failed to get game IDs:', err);
    res.status(500).json({ message: 'Failed to get game IDs' });
  }
});

module.exports = gameOfLifeRouter;
