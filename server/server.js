const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();
const connectDB = require('./config/db');
connectDB();

const app = express();

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'https://paluwasathi.vercel.app'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'PaluwaSathi API running',
    timestamp: new Date() 
  });
});

app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to PaluwaSathi API' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error.'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('PaluwaSathi Server running on port ' + PORT);
  console.log('Health: http://localhost:' + PORT + '/api/health');
});