const express = require('express');
const app = express();

// Global variables to store information about envelopes and total budget
let envelopes = [];
let totalBudget = 0;

app.use(express.json()); // Middleware to parse JSON requests

// Endpoint to generate individual budget envelopes
app.post('/envelopes', (req, res) => {
  const { title, budget } = req.body;

  // Validate request body
  if (!title || !budget || typeof budget !== 'number' || budget <= 0) {
    return res.status(400).json({ error: 'Invalid request. Title and budget are required and budget must be a positive number.' });
  }

  // Create a new envelope object
  const envelope = {
    id: envelopes.length + 1,
    title,
    budget,
    balance: budget, // Initially, balance is the same as the budget
  };

  // Add the envelope to the envelopes array
  envelopes.push(envelope);

  // Update the total budget
  totalBudget += budget;

  // Return the newly created envelope as the response
  res.status(201).json(envelope);
});

// Endpoint to retrieve all envelopes
app.get('/envelopes', (req, res) => {
    res.json(envelopes);
});

// Endpoint to retrieve a specific envelope
app.get('/envelopes/:id', (req, res) => {
  const id = +req.params.id;

  // Find the envelope with the corresponding ID
  const envelope = envelopes.find((env) => env.id === id);

  // Check if the envelope exists
  if (!envelope) {
    return res.status(404).json({ error: 'Envelope not found.' });
  }

  // Return the envelope as the response
  res.json(envelope);
});

// Endpoint to update specific envelopes
app.put('/envelopes/:id', (req, res) => {
  const id = +req.params.id;
  const { amount, budget } = req.body;

  // Find the envelope with the corresponding ID
  const envelope = envelopes.find((env) => env.id === id);

  // Check if the envelope exists
  if (!envelope) {
    return res.status(404).json({ error: 'Envelope not found.' });
  }

  // Update the envelope's properties based on the request body
  if (typeof amount === 'number' && amount !== 0) {
    // Update the envelope balance based on the extracted amount
    envelope.balance -= amount;

    // Update the total budget accordingly
    totalBudget -= amount;
  }

  if (typeof budget === 'number' && budget >= 0) {
    // Update the envelope budget if provided in the request body
    envelope.budget = budget;
  }

  // Return the updated envelope as the response
  res.json(envelope);
});

// Endpoint to delete specific envelopes (DELETE request)
app.delete('/envelopes/:id', (req, res) => {
  const id = +req.params.id;

  // Find the envelope with the corresponding ID
  const envelopeToDelete = envelopes.find((env) => env.id === id);

  // Check if the envelope exists
  if (!envelopeToDelete) {
    return res.status(404).json({ error: 'Envelope not found.' });
  }

  // Create a new array without the deleted envelope using the filter method
  envelopes = envelopes.filter((env) => env.id !== id);

  // Update the total budget by subtracting the deleted envelope's balance
  totalBudget -= envelopeToDelete.balance;

  // Send a message indicating that the envelope was deleted
  const message = `Envelope "${envelopeToDelete.title}" was deleted.`;
  res.send(JSON.stringify({ message }, null, 2).replace(/\\n|\\r|\\|\\/g, '')); // removing slashes from the response XD
});

// Endpoint to transfer budgets between envelopes (POST request)
app.post('/envelopes/transfer/:from/:to', (req, res) => {
  const fromId = +req.params.from;
  const toId = +req.params.to;
  const amount = +req.body.amount;

  // Find the 'from' envelope with the corresponding ID
  const fromEnvelope = envelopes.find((env) => env.id === fromId);

  // Check if the 'from' envelope exists
  if (!fromEnvelope) {
    return res.status(404).json({ error: 'Source envelope not found.' });
  }

  // Find the 'to' envelope with the corresponding ID
  const toEnvelope = envelopes.find((env) => env.id === toId);

  // Check if the 'to' envelope exists
  if (!toEnvelope) {
    return res.status(404).json({ error: 'Destination envelope not found.' });
  }

  // Check if the amount is a valid number greater than zero
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount provided.' });
  }

  // Check if the 'from' envelope has sufficient balance for the transfer
  if (fromEnvelope.balance < amount) {
    return res.status(400).json({ error: 'Insufficient balance in the source envelope.' });
  }

  // Perform the budget transfer
  fromEnvelope.balance -= amount;
  toEnvelope.balance += amount;

  // Return the updated envelopes as the response (optional)
  res.json({ fromEnvelope, toEnvelope });
});

// Root route to display the total budget
app.get('/', (req, res) => {
  res.send(`Total Budget: ${totalBudget}€`);
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
