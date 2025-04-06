import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['tasks', 'articles', 'ideas', 'knowledge']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Item', itemSchema); 