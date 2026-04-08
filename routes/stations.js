// স্টেশন রাউট - পাম্পের তথ্য পাওয়া ও যোগ করার জন্য
const express = require('express');
const router = express.Router();
const Station = require('../models/Station');
const Update = require('../models/Update');

// ─── GET /api/stations ───────────────────────────────────────────────
// সব পাম্পের তালিকা + প্রতিটির সর্বশেষ আপডেট পাঠায়
router.get('/', async (req, res) => {
  try {
    // সব সক্রিয় স্টেশন খুঁজে বের করা
    const stations = await Station.find({ isActive: true }).lean();

    // প্রতিটি স্টেশনের সর্বশেষ আপডেট যুক্ত করা
    const stationsWithUpdates = await Promise.all(
      stations.map(async (station) => {
        // সবচেয়ে নতুন আপডেট খুঁজে বের করা
        const latestUpdate = await Update.findOne({ stationId: station._id })
          .sort({ createdAt: -1 }) // সর্বশেষটি আগে
          .lean();

        return {
          ...station,
          // আপডেট থাকলে সেটি, না থাকলে ডিফল্ট মান
          latestUpdate: latestUpdate || {
            petrol: false,
            diesel: false,
            octane: false,
            crowd: 'none',
            createdAt: null,
          },
        };
      })
    );

    res.json({
      success: true,
      data: stationsWithUpdates,
    });
  } catch (error) {
    console.error('স্টেশন লোড করতে সমস্যা:', error);
    res.status(500).json({
      success: false,
      message: 'তথ্য লোড করতে সমস্যা হয়েছে',
    });
  }
});

// ─── GET /api/stations/:id/history ───────────────────────────────────
// একটি নির্দিষ্ট পাম্পের আপডেটের ইতিহাস (সর্বশেষ ১০টি)
router.get('/:id/history', async (req, res) => {
  try {
    const updates = await Update.find({ stationId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      data: updates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ইতিহাস লোড করতে সমস্যা হয়েছে',
    });
  }
});

// ─── POST /api/stations ──────────────────────────────────────────────
// নতুন স্টেশন যোগ করা (অ্যাডমিনের জন্য)
router.post('/', async (req, res) => {
  try {
    const { name, location } = req.body;

    // যাচাই
    if (!name || !location) {
      return res.status(400).json({
        success: false,
        message: 'পাম্পের নাম ও অবস্থান দেওয়া আবশ্যক',
      });
    }

    const station = await Station.create({ name, location });

    res.status(201).json({
      success: true,
      message: 'নতুন পাম্প যোগ করা হয়েছে',
      data: station,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'পাম্প যোগ করতে সমস্যা হয়েছে',
    });
  }
});

// ─── PUT /api/stations/:id ───────────────────────────────────────────
// স্টেশনের তথ্য আপডেট করা
router.put('/:id', async (req, res) => {
  try {
    const { name, location, isActive } = req.body;

    const station = await Station.findByIdAndUpdate(
      req.params.id,
      { name, location, isActive },
      { new: true, runValidators: true }
    );

    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'পাম্প পাওয়া যায়নি',
      });
    }

    res.json({
      success: true,
      message: 'পাম্পের তথ্য আপডেট হয়েছে',
      data: station,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'আপডেট করতে সমস্যা হয়েছে',
    });
  }
});

module.exports = router;
