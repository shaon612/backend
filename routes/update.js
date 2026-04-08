// আপডেট রাউট - জ্বালানির নতুন তথ্য জমা দেওয়ার জন্য
const express = require('express');
const router = express.Router();
const Update = require('../models/Update');
const Station = require('../models/Station');

// ─── POST /api/update ─────────────────────────────────────────────────
// নতুন জ্বালানি আপডেট জমা দেওয়া
router.post('/', async (req, res) => {
  try {
    const { stationId, petrol, diesel, octane, crowd, reporterName } = req.body;

    // ── ইনপুট যাচাই ──────────────────────────────────────────────────
    if (!stationId) {
      return res.status(400).json({
        success: false,
        message: 'পাম্প নির্বাচন করা আবশ্যক',
      });
    }

    // ভিড়ের মান সঠিক কিনা যাচাই
    const validCrowdValues = ['none', 'medium', 'heavy'];
    if (crowd && !validCrowdValues.includes(crowd)) {
      return res.status(400).json({
        success: false,
        message: 'ভিড়ের তথ্য সঠিক নয়',
      });
    }

    // স্টেশন আছে কিনা যাচাই
    const station = await Station.findById(stationId);
    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'পাম্প পাওয়া যায়নি',
      });
    }

    // ── স্প্যাম সুরক্ষা: একই পাম্পে ৫ মিনিটে একাধিক আপডেট নয় ─────────
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentUpdate = await Update.findOne({
      stationId,
      createdAt: { $gte: fiveMinutesAgo },
    });

    if (recentUpdate) {
      return res.status(429).json({
        success: false,
        message: 'এই পাম্পে ৫ মিনিট আগে আপডেট দেওয়া হয়েছে। একটু পরে চেষ্টা করুন।',
      });
    }

    // ── নতুন আপডেট সংরক্ষণ ───────────────────────────────────────────
    const update = await Update.create({
      stationId,
      petrol: Boolean(petrol),
      diesel: Boolean(diesel),
      octane: Boolean(octane),
      crowd: crowd || 'none',
      reporterName: reporterName?.trim() || 'অজানা',
    });

    res.status(201).json({
      success: true,
      message: 'তথ্য সফলভাবে জমা দেওয়া হয়েছে! ধন্যবাদ।',
      data: update,
    });
  } catch (error) {
    console.error('আপডেট জমা দিতে সমস্যা:', error);

    // MongoDB ObjectId ত্রুটি ধরা
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'স্টেশন আইডি সঠিক নয়',
      });
    }

    res.status(500).json({
      success: false,
      message: 'তথ্য জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
    });
  }
});

// ─── GET /api/update/recent ──────────────────────────────────────────
// সর্বশেষ ২০টি আপডেট দেখা
router.get('/recent', async (req, res) => {
  try {
    const updates = await Update.find()
      .populate('stationId', 'name location') // পাম্পের নাম ও অবস্থান যুক্ত করা
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({
      success: true,
      data: updates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'তথ্য লোড করতে সমস্যা হয়েছে',
    });
  }
});

module.exports = router;
