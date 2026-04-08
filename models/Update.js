// আপডেট মডেল - প্রতিটি পাম্পের জ্বালানি ও ভিড়ের তথ্য সংরক্ষণ করে
const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema(
  {
    // কোন পাম্পের আপডেট
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      required: [true, 'পাম্প নির্বাচন করা আবশ্যক'],
    },
    // পেট্রোল আছে কিনা
    petrol: {
      type: Boolean,
      default: false,
    },
    // ডিজেল আছে কিনা
    diesel: {
      type: Boolean,
      default: false,
    },
    // অকটেন আছে কিনা
    octane: {
      type: Boolean,
      default: false,
    },
    // ভিড়ের পরিমাণ: none=ভিড় নেই, medium=মাঝারি ভিড়, heavy=বেশি ভিড়
    crowd: {
      type: String,
      enum: ['none', 'medium', 'heavy'],
      default: 'none',
    },
    // আপডেটকারীর নাম (ঐচ্ছিক)
    reporterName: {
      type: String,
      trim: true,
      default: 'অজানা',
    },
  },
  {
    timestamps: true, // createdAt স্বয়ংক্রিয়ভাবে যুক্ত হবে
  }
);

module.exports = mongoose.model('Update', updateSchema);
