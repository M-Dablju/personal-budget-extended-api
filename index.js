const express = require('express');
const app = express();
const pool = require('./db');

app.use(express.json()); // Middleware to parse JSON requests

// Endpoint to generate individual budget envelopes
app.post('/envelopes', async (req, res) => {
  const { title, budget } = req.body;

  // Validate request body
  if (!title || !budget || typeof budget !== 'number' || budget <= 0) {
    return res.status(400).json({ error: 'Invalid request. Title and budget are required and budget must be a positive number.' });
  }

  try {
    const result = await pool.query('INSERT INTO envelopes (title, budget, balance) VALUES ($1, $2, $2) RETURNING *', [title, budget]);
    const newEnvelope = result.rows[0];

    const totalBudgetResult = await pool.query('SELECT SUM(budget) AS total_budget FROM envelopes');
    const totalBudget = totalBudgetResult.rows[0].total_budget;
    await pool.query('UPDATE budget SET total_budget = $1', [totalBudget]);

    res.status(201).json(newEnvelope);
  } catch (error) {
    console.error('Error creating envelope:', error);
    res.status(500).json({ error: 'An error occurred while generating the envelope.' });
  }
});

// Endpoint to retrieve all envelopes
app.get('/envelopes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM envelopes');
    const envelopes = result.rows;
    res.json(envelopes);
  } catch (error) {
    console.error('Error retrieving envelopes:', error);
    res.status(500).json({ error: 'An error occurred while retrieving envelopes.' });
  }
});

// Endpoint to retrieve a specific envelope
app.get('/envelopes/:id', async (req, res) => {
  const id = +req.params.id;

  try {
    const result = await pool.query('SELECT * FROM envelopes WHERE id = $1', [id]);
    const envelope = result.rows[0];

    if (!envelope) {
      return res.status(404).json({ error: 'Envelope not found.' });
    }

    res.json(envelope);
  } catch (error) {
    console.error('Error retrieving envelope:', error);
    res.status(500).json({ error: 'An error occurred while retrieving the envelope.' });
  }
});

// Endpoint to update specific envelopes
app.put('/envelopes/:id', async (req, res) => {
  const id = +req.params.id;
  const { amount, budget } = req.body;

  try {
    const result = await pool.query('SELECT * FROM envelopes WHERE id = $1', [id]);
    const envelope = result.rows[0];

    if (!envelope) {
      return res.status(404).json({ error: 'Envelope not found.' });
    }

    if (typeof amount === 'number' && amount !== 0) {
      envelope.balance -= amount;

      const totalBudgetResult = await pool.query('SELECT total_budget FROM budget');
      const currentTotalBudget = totalBudgetResult.rows[0].total_budget;
      await pool.query('UPDATE budget SET total_budget = $1', [currentTotalBudget - amount]);
    }

    if (typeof budget === 'number' && budget >= 0) {
      envelope.budget = budget;
      await pool.query('UPDATE envelopes SET budget = $1 WHERE id = $2', [budget, id]);
    } else if (typeof budget !== 'undefined') {
      return res.status(400).json({ error: 'Invalid budget. Budget must be a positive number.' });
    }

    res.json(envelope);
  } catch (error) {
    console.error('Error updating envelope:', error);
    res.status(500).json({ error: 'An error occurred while updating the envelope.' });
  }
});

// Endpoint to delete specific envelopes 
app.delete('/envelopes/:id', async (req, res) => {
  const id = +req.params.id;

  try {
    const result = await pool.query('SELECT * FROM envelopes WHERE id = $1', [id]);
    const envelope = result.rows[0];

    if (!envelope) {
      return res.status(404).json({ error: 'Envelope not found.' });
    }

    await pool.query('DELETE FROM envelopes WHERE id = $1', [id]);

    await pool.query('UPDATE budget SET total_budget = total_budget - $1', [envelope.budget]);

    const message = `Envelope "${envelope.title}" was deleted.`;
    res.json({ message });
  } catch (error) {
    console.error('Error deleting envelope:', error);
    res.status(500).json({ error: 'An error occurred while deleting the envelope.' });
  }
});

// Endpoint to transfer budgets between envelopes 
app.post('/envelopes/transfer/:from/:to', async (req, res) => {
  const fromId = +req.params.from;
  const toId = +req.params.to;
  const amount = +req.body.amount;

  try {
    const fromEnvelopeResult = await pool.query('SELECT * FROM envelopes WHERE id = $1', [fromId]);
    const fromEnvelope = fromEnvelopeResult.rows[0];

    if (!fromEnvelope) {
      return res.status(404).json({ error: 'Source envelope not found.' });
    }

    const toEnvelopeResult = await pool.query('SELECT * FROM envelopes WHERE id = $1', [toId]);
    const toEnvelope = toEnvelopeResult.rows[0];

    if (!toEnvelope) {
      return res.status(404).json({ error: 'Destination envelope not found.' });
    }

    if (isNaN(amount) || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount provided. Amount must be a valid number greater than zero.' });
    }

    if (fromEnvelope.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance in the source envelope.' });
    }

    const fromBalance = Number(fromEnvelope.balance);
    const toBalance = Number(toEnvelope.balance);

    fromEnvelope.balance = fromBalance - amount;
    toEnvelope.balance = toBalance + amount;

    const newFromBalance = Number(fromEnvelope.balance);
    const newToBalance = Number(toEnvelope.balance);

    await pool.query('UPDATE envelopes SET balance = $1 WHERE id = $2', [newFromBalance, fromId]);
    await pool.query('UPDATE envelopes SET balance = $1 WHERE id = $2', [newToBalance, toId]);

    res.json({ fromEnvelope, toEnvelope });
  } catch (error) {
    console.error('Error transferring budget:', error);
    res.status(500).json({ error: 'An error occurred while transferring the budget.' });
  }
});

app.get('/', async (req, res) => {
  try {
    const totalBudgetResult = await pool.query('SELECT total_budget FROM budget');
    const totalBudget = totalBudgetResult.rows[0].total_budget;

    const envelopesResult = await pool.query('SELECT * FROM envelopes');
    const envelopes = envelopesResult.rows;

    let envelopesSummary = '';
    envelopes.forEach((envelope) => {
      envelopesSummary += `<p>Envelope: ${envelope.title}</p>`;
      envelopesSummary += `<p>Budget: ${envelope.budget}€</p>`;
      envelopesSummary += `<p>Balance: ${envelope.balance}€</p><br>`;
    });

    res.send(`<p>Total Budget: ${totalBudget}€</p><br>${envelopesSummary}`);
  } catch (error) {
    console.error('Error retrieving total budget:', error);
    res.status(500).json({ error: 'An error occurred while retrieving the total budget.' });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
