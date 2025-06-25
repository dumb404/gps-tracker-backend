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

// Schema: deviceName format = Res + 3 digit country code + 6 digit reg number (e.g. Res880000002)
const gpsSchema = new mongoose.Schema({
  deviceName: {
    type: String,
    required: true,
    match: /^Res\d{3}\d{6}$/ // Regex: Res + 3 digits + 6 digits
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

// ✅ Home page route (fixes "Cannot GET /" error)
app.get('/', (req, res) => {
  res.send('✅ GPS Tracker Backend is running!');
});

// POST endpoint to receive GPS data
app.post('/location', async (req, res) => {
  const { deviceName, latitude, longitude } = req.body;

  // Input validation
  if (
    typeof deviceName !== 'string' || !/^Res\d{3}\d{6}$/.test(deviceName) ||
    typeof latitude !== 'number' ||
    typeof longitude !== 'number'
  ) {
    return res.status(400).json({ message: 'Invalid input: deviceName must be in format Res + 3 digit country code + 6 digit reg number' });
  }

  try {
    const location = new GpsLocation({ deviceName, latitude, longitude });
    await location.save();
    res.status(200).json({ message: '📍 GPS data saved', location });
  } catch (err) {
    res.status(500).json({ message: '❌ Database error', error: err });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Server running on http://localhost:${PORT}`);
});
