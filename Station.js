// স্টেশন মডেল - প্রতিটি জ্বালানি পাম্পের তথ্য সংরক্ষণ করে
const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema(
  {
    // পাম্পের নাম
    name: {
      type: String,
      required: [true, 'পাম্পের নাম দেওয়া আবশ্যক'],
      trim: true,
    },
    // পাম্পের অবস্থান
    location: {
      type: String,
      required: [true, 'অবস্থান দেওয়া আবশ্যক'],
      trim: true,
    },
    // পাম্প চালু আছে কিনা
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt ও updatedAt স্বয়ংক্রিয়ভাবে যুক্ত হবে
  }
);

module.exports = mongoose.model('Station', stationSchema);
