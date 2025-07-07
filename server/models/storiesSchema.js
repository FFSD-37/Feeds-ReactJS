import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true 
});

const Story = mongoose.model('stories', linkSchema);
export default Story;