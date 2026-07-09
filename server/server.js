const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

require('./config/cloudinary');

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
  res.json({ status: 'ok', message: 'PaluwaSathi API running', timestamp: new Date() });
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/rescues', require('./routes/rescue.routes'));
app.use('/api/pets',      require('./routes/pet.routes'));
app.use('/api/adoptions', require('./routes/adoption.routes'));
app.use('/api/campaigns', require('./routes/campaign.routes'));
app.use('/api/donations', require('./routes/donation.routes'));
app.use('/api/tasks',     require('./routes/task.routes'));
app.use('/api/signups',   require('./routes/signup.routes'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error.'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('PaluwaSathi Server running on port ' + PORT);
});