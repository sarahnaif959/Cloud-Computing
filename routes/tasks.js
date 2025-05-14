const express = require('express');
const jwt = require("jsonwebtoken");
const router = express.Router();
const Task = require('../models/Task');

// ✅ GET all tasks for the logged-in user
router.get('/', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { status, priority, search } = req.query;
    const filter = { userId: decoded.userId }; // ⬅️ نجيب فقط مهام المستخدم نفسه

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) filter.title = new RegExp(search, 'i');

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// ✅ POST a new task
router.post('/', async (req, res) => {
  const { title, dueDate, priority, status } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const newTask = new Task({
      title,
      dueDate,
      priority,
      status: status || "TO DO", // ⬅️ الافتراضي TO DO لو ما تحدد
      userId: decoded.userId
    });

    const saved = await newTask.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: 'Invalid task data or token' });
  }
});

// ✅ PUT (update) a task
router.put('/:id', async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// ✅ DELETE a task
router.delete('/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;
