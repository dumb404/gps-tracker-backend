const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();

dotenv.config();

// Connect to MongoDB
console.log("Mongo URI:", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Define Mongoose schema with deviceName
const gpsSchema = new mongoose.Schema({
  deviceName: {
    type: String,
    required: true,
    match: /^[0-9]{6}[A-Za-z]{3}$/ // Regex: 6 digits + 3 letters
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const GpsLocation = mongoose.model('GpsLocation', gpsSchema);

// Middleware to parse JSON
app.use(express.json());

// POST endpoint
app.post('/location', async (req, res) => {
  const { deviceName, latitude, longitude } = req.body;

  // Input validation
  if (
    typeof deviceName !== 'string' || !/^[0-9]{6}[A-Za-z]{3}$/.test(deviceName) ||
    typeof latitude !== 'number' ||
    typeof longitude !== 'number'
  ) {
    return res.status(400).json({ message: 'Invalid input: deviceName must be 6 digits + 3 letters' });
  }

  try {
    const location = new GpsLocation({ deviceName, latitude, longitude });
    await location.save();
    res.status(200).json({ message: 'GPS data saved', location });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Server running on http://localhost:${PORT}`);
});
