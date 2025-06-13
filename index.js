require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Branch = require('./Branch');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Connect to MongoDB Atlas
const MONGO_URL = process.env.MONGO_URL; // <-- Replace with your connection string
mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Endpoint: Get all unique banks
app.get('/api/banks', async (req, res) => {
  try {
    const banks = await Branch.distinct('BANK');
    res.json(banks.sort());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Get states for selected bank
app.get('/api/states', async (req, res) => {
  const { bank } = req.query;
  if (!bank) return res.status(400).json({ error: 'bank required' });
  try {
    const states = await Branch.distinct('STATE', { BANK: bank });
    res.json(states.sort());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Get cities for selected bank and state
app.get('/api/cities', async (req, res) => {
  const { bank, state } = req.query;
  if (!bank || !state) return res.status(400).json({ error: 'bank and state required' });
  try {
    const cities = await Branch.distinct('CITY', { BANK: bank, STATE: state });
    res.json(cities.sort());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Get branches for selected bank, state, and city
app.get('/api/branches', async (req, res) => {
  const { bank, state, city } = req.query;
  if (!bank || !state || !city) return res.status(400).json({ error: 'bank, state, and city required' });
  try {
    const branches = await Branch.find(
      { BANK: bank, STATE: state, CITY: city },
      { BRANCH: 1, IFSC: 1, _id: 0 }
    ).sort({ BRANCH: 1 });
    res.json(branches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Get IFSC details (already present, but included for completeness)
app.get('/api/ifsc/:ifsc', async (req, res) => {
  try {
    const branch = await Branch.findOne({ IFSC: req.params.ifsc });
    if (!branch) return res.status(404).json({ error: 'Not found' });
    res.json(branch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
