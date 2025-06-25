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

// Define Mongoose schema with deviceName format: Res + 3 digits + 6 digits
const gpsSchema = new mongoose.Schema({
  deviceName: {
    type: String,
    required: true,
    match: /^Res[0-9]{3}[0-9]{6}$/ // Regex: Res + 3 digits + 6 digits
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

// POST endpoint to receive GPS data
app.post('/location', async (req, res) => {
  const { deviceName, latitude, longitude } = req.body;

  // Input validation
  if (
    typeof deviceName !== 'string' || !/^Res[0-9]{3}[0-9]{6}$/.test(deviceName) ||
    typeof latitude !== 'number' ||
    typeof longitude !== 'number'
  ) {
    return res.status(400).json({ 
      message: 'Invalid input: deviceName must be in the format Res + 3 digits (country code) + 6 digits (reg number), e.g. Res880000002' 
    });
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
