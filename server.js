const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit for Base64 images
app.use(express.static('.')); // Serve static files from root for now

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kaftycards')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
