require('dotenv').config();

const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const feedRoutes = require('./routes/feed');
const authRouter = require('./routes/auth');

const app = express();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4());
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParser.json());
app.use(multer({ storage, fileFilter }).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRouter);

app.use((error, req, res, next) => {
  console.log(error);
  const { statusCode = 500, message, data = null } = error;
  res.status(statusCode).json({ message, data });
});

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 8080;

if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not set!');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    const io = require('./socket').init(server);
    io.on('connection', (socket) => {
      console.log('Client Connected!');
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
