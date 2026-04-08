// ডেটাবেস সিডার - জয়পুরহাটের পাম্পগুলোর প্রাথমিক তথ্য যোগ করা
const mongoose = require('mongoose');
require('dotenv').config();

const Station = require('./models/Station');
const Update = require('./models/Update');

// জয়পুরহাটের বাস্তব পাম্পের তালিকা
const stations = [
  { name: 'মেঘনা পেট্রোলিয়াম', location: 'জয়পুরহাট সদর, ঢাকা রোড' },
  { name: 'যমুনা ফিলিং স্টেশন', location: 'বাস স্ট্যান্ড, জয়পুরহাট' },
  { name: 'পদ্মা অয়েল ডিপো', location: 'আক্কেলপুর রোড, জয়পুরহাট' },
  { name: 'এস.পি. ফিলিং স্টেশন', location: 'কালাই মোড়, জয়পুরহাট' },
  { name: 'ইস্টার্ন ফুয়েল পয়েন্ট', location: 'পাঁচবিবি রোড, জয়পুরহাট' },
  { name: 'রহমানিয়া পেট্রোল পাম্প', location: 'হাসপাতাল মোড়, জয়পুরহাট' },
  { name: 'বাংলাদেশ পেট্রোলিয়াম', location: 'স্টেশন রোড, জয়পুরহাট' },
  { name: 'নর্থ বেঙ্গল ফিলিং', location: 'ক্ষেতলাল মোড়, জয়পুরহাট' },
];

async function seedDatabase() {
  try {
    // MongoDB-তে সংযুক্ত হওয়া
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB-তে সংযুক্ত হয়েছে');

    // পুরনো ডেটা মুছে ফেলা
    await Station.deleteMany({});
    await Update.deleteMany({});
    console.log('🗑️  পুরনো ডেটা মুছে ফেলা হয়েছে');

    // নতুন স্টেশন যোগ করা
    const createdStations = await Station.insertMany(stations);
    console.log(`✅ ${createdStations.length}টি পাম্প যোগ করা হয়েছে`);

    // প্রতিটি স্টেশনের জন্য নমুনা আপডেট যোগ করা
    const sampleUpdates = createdStations.map((station, index) => ({
      stationId: station._id,
      petrol: index % 3 !== 0,    // কিছু পাম্পে পেট্রোল নেই
      diesel: true,                // সব পাম্পে ডিজেল আছে
      octane: index % 2 === 0,    // কিছু পাম্পে অকটেন আছে
      crowd: ['none', 'medium', 'heavy'][index % 3], // বিভিন্ন ভিড়
      reporterName: 'সিস্টেম',
    }));

    await Update.insertMany(sampleUpdates);
    console.log(`✅ ${sampleUpdates.length}টি নমুনা আপডেট যোগ করা হয়েছে`);

    console.log('\n🎉 ডেটাবেস প্রস্তুত! এখন সার্ভার চালু করুন।');
    process.exit(0);
  } catch (error) {
    console.error('❌ সিড করতে সমস্যা:', error.message);
    process.exit(1);
  }
}

seedDatabase();
