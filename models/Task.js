const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dueDate: { type: Date, required: false },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Low' },
  status: { type: String, enum: ['TO DO', 'IN PROGRESS', 'COMPLETE'], default: 'TO DO' },
  createdAt: { type: Date, default: Date.now },

  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

module.exports = mongoose.model("Task", taskSchema);
