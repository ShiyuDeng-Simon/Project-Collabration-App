const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateTask = (req, res, next) => {
  const { user_email, title, progress, date } = req.body;

  if (!user_email || !validateEmail(user_email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  if (!title || title.trim().length === 0) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  if (title.length > 255) {
    return res.status(400).json({ error: 'Task title must be less than 255 characters' });
  }

  if (progress !== undefined && (isNaN(progress) || progress < 0 || progress > 100)) {
    return res.status(400).json({ error: 'Progress must be a number between 0 and 100' });
  }

  next();
};

const validateProject = (req, res, next) => {
  const { title, description, status } = req.body;

  if (!title || title.trim().length === 0) {
    return res.status(400).json({ error: 'Project title is required' });
  }

  if (title.length > 255) {
    return res.status(400).json({ error: 'Project title must be less than 255 characters' });
  }

  if (description && description.length > 2000) {
    return res.status(400).json({ error: 'Description must be less than 2000 characters' });
  }

  if (status && !['Planning', 'Active', 'Completed'].includes(status)) {
    return res.status(400).json({ error: 'Status must be Planning, Active, or Completed' });
  }

  next();
};

module.exports = { validateEmail, validateTask, validateProject };

