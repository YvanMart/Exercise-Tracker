const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

let users = [];

// Create a new user
app.post('/api/users', (req, res) => {
  const newUser = { username: req.body.username, _id: Date.now().toString() };
  users.push(newUser);
  res.json(newUser);
});

// Get all users
app.get('/api/users', (req, res) => {
  res.json(users.map(user => ({ username: user.username, _id: user._id })));
});

// Add exercise to user
app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = req.params._id;
  const user = users.find(user => user._id === userId);
  
  if (!user) {
    return res.status(404).send('Unknown user');
  }

  const exercise = {
    description: req.body.description,
    duration: parseInt(req.body.duration),
    date: req.body.date ? new Date(req.body.date) : new Date()
  };

  if (!user.exercises) {
    user.exercises = [];
  }
  user.exercises.push(exercise);

  res.json({
    _id: user._id,
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString()
  });
});

// Get user's exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const user = users.find(user => user._id === userId);
  
  if (!user) {
    return res.status(404).send('Unknown user');
  }

  let log = user.exercises.map(exercise => ({
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString()
  }));

  const from = req.query.from ? new Date(req.query.from) : undefined;
  const to = req.query.to ? new Date(req.query.to) : undefined;
  const limit = parseInt(req.query.limit);

  if (from) {
    log = log.filter(exercise => new Date(exercise.date) >= from);
  }
  if (to) {
    log = log.filter(exercise => new Date(exercise.date) <= to);
  }
  if (limit) {
    log = log.slice(0, limit);
  }

  res.json({ username: user.username, count: log.length, _id: user._id, log });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
