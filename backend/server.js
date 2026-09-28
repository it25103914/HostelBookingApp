const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// .env file
dotenv.config();

const app = express();
console.log('MY SERVER FILE IS RUNNING');

app.use((req, res, next) => {
  console.log('REQUEST RECEIVED:', req.method, req.url);
  next();
});

// Middleware
app.use(express.json());
app.use(cors());


// Uploads folder එක public කිරීම
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);


// Routes
app.use(
  '/api/auth',
  require('./routes/authRoutes')
);

app.get('/test', (req, res) => {
  res.json({
    message: 'Main server is working!'
  });
});

app.use(
  '/api/rooms',
  require('./routes/roomRoutes')
);

app.use(
  '/api/bookings',
  require('./routes/bookingRoutes')
);


// Port
const PORT = process.env.PORT || 5000;


// MongoDB URL
const MONGO_URI = process.env.MONGO_URI;


// Connect MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {

    console.log(
      'MongoDB Database Connected Successfully!'
    );

    // Start server
    app.listen(PORT, () => {

      console.log(
        `Server is running on port ${PORT}`
      );

    });

  })
  .catch((err) => {

    console.error(
      'Database connection error:',
      err
    );

  });