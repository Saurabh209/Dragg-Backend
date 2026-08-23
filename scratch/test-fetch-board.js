import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { FreestyleBoardModel } from '../freestyle/freestyle.modal.js';
import { BoardModel } from '../modal.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://saurabhhh209:EldenLord@cluster0.amdmprb.mongodb.net/canvas-board';

async function testFetch() {
  await mongoose.connect(MONGO_URI);
  const freestyleBoard = await FreestyleBoardModel.findOne({ _id: 'fs_6a536970883050c5bc124c9c' }).lean();
  console.log('--- FreestyleBoardModel result ---');
  console.log('Name:', freestyleBoard?.name);
  console.log('Cards count:', freestyleBoard?.cards?.length);
  console.log('Cards sample:', JSON.stringify(freestyleBoard?.cards?.slice(0, 2), null, 2));

  const allFreestyle = await FreestyleBoardModel.find({}).lean();
  console.log('All freestyle boards count:', allFreestyle.length);
  console.log('All freestyle boards IDs:', allFreestyle.map(b => ({ id: b._id, name: b.name, cards: b.cards?.length })));

  await mongoose.disconnect();
}

testFetch();
