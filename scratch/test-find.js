import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { FreestyleBoardModel } from '../freestyle/freestyle.modal.js';
import { BoardModel } from '../modal.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://saurabhhh209:EldenLord@cluster0.amdmprb.mongodb.net/canvas-board';

async function check() {
  await mongoose.connect(MONGO_URI);
  
  console.log('--- 1. Testing FreestyleBoardModel.findOne ---');
  const b1 = await FreestyleBoardModel.findOne({ _id: 'fs_6a536970883050c5bc124c9c' }).lean();
  console.log('b1 found:', !!b1);
  console.log('b1 cards length:', b1?.cards?.length);

  console.log('\n--- 2. Testing FreestyleBoardModel.findById ---');
  try {
    const b2 = await FreestyleBoardModel.findById('fs_6a536970883050c5bc124c9c').lean();
    console.log('b2 found:', !!b2);
    console.log('b2 cards length:', b2?.cards?.length);
  } catch (err) {
    console.error('b2 error:', err.message);
  }

  console.log('\n--- 3. Testing BoardModel legacy ---');
  const b3 = await BoardModel.find({}).lean();
  console.log('Legacy boards in BoardModel:', b3.map(b => ({ id: b._id, name: b.name, cards: b.cards?.length })));

  console.log('\n--- 4. Testing FreestyleBoardModel all ---');
  const b4 = await FreestyleBoardModel.find({}).lean();
  console.log('Freestyle boards in FreestyleBoardModel:', b4.map(b => ({ id: b._id, name: b.name, cards: b.cards?.length })));

  await mongoose.disconnect();
}

check();
