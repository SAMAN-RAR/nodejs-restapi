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

const MONGODB_URI =
  'mongodb+srv://saman:930957S.f@cluster0.nkbt7xy.mongodb.net/messages?appName=Cluster0';
mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    const server = app.listen(8080);
    const io = require('./socket').init(server);
    io.on('connection', (socket) => {
      console.log('Clinet Connected!');
    });
  })
  .catch((err) => {
    console.log(err);
  });
