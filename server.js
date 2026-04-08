// ─────────────────────────────────────────────────────────────────────────────
// জয়পুরহাট জ্বালানি ট্র্যাকার - মেইন সার্ভার
// ─────────────────────────────────────────────────────────────────────────────
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ── মিডলওয়্যার সেটআপ ────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json()); // JSON বডি পার্স করার জন্য
app.use(express.urlencoded({ extended: true }));

// ── রিকোয়েস্ট লগিং (ডেভেলপমেন্টের জন্য) ────────────────────────────────────
app.use((req, res, next) => {
  console.log(`📡 ${new Date().toLocaleTimeString('bn-BD')} | ${req.method} ${req.path}`);
  next();
});

// ── API রাউট ──────────────────────────────────────────────────────────────────
app.use('/api/stations', require('./routes/stations'));
app.use('/api/update', require('./routes/updates'));

// ── হেলথ চেক ─────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'সার্ভার চলছে ✅',
    time: new Date().toLocaleString('bn-BD'),
    database: mongoose.connection.readyState === 1 ? 'সংযুক্ত ✅' : 'সংযুক্ত নয় ❌',
  });
});

// ── ৪০৪ হ্যান্ডলার ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'এই পেজটি পাওয়া যায়নি',
  });
});

// ── গ্লোবাল এরর হ্যান্ডলার ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ সার্ভার ত্রুটি:', err.message);
  res.status(500).json({
    success: false,
    message: 'সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
  });
});

// ── MongoDB সংযোগ ও সার্ভার চালু ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB-তে সফলভাবে সংযুক্ত হয়েছে');
    app.listen(PORT, () => {
      console.log(`\n🚀 সার্ভার চলছে: http://localhost:${PORT}`);
      console.log(`📋 API স্বাস্থ্য: http://localhost:${PORT}/api/health`);
      console.log(`⛽ পাম্প তালিকা: http://localhost:${PORT}/api/stations\n`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB সংযোগ ব্যর্থ:', err.message);
    console.error('💡 MongoDB চলছে কিনা নিশ্চিত করুন: mongod');
    process.exit(1);
  });
