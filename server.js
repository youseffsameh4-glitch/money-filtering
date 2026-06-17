require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const path = require('path');

const app = express();// must be first before any app use

// 1. Import routes
const userRoutes = require('./routes/userRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

// 2. rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// 3. middleware (ORDER MATTERS)
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})); 

app.use(express.json());//let's the app expect json data

app.use(helmet());

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc:  ["'self'", "'unsafe-inline'"],
    styleSrc:   ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc:    ["'self'", "https://fonts.gstatic.com"],
    imgSrc:     ["'self'", "data:"],
    connectSrc: ["'self'", "http://localhost:3000"]
  }
}));

app.use(limiter);

// 4. serve the front-end
app.use(express.static(path.join(__dirname, 'public')));

// 5. mount routes
app.use('/api/v1/users',userRoutes);
app.use('/api/v1/expenses', expenseRoutes);


// 6. global error handller
app.use((error, req, res, next) => {
  console.error("💥 Global Error Caught:", error);
  // if the error came with a certin status code, use it, else default to 500
  const statusCode = error.statusCode || 500;

  const message = process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message;

  res.status(statusCode).json({
    status: 'fail',
    message: error.message || 'Something went wrong in the server'
  });
});


// 7. Start the server and listen on port 3000
app.listen(3000, () => {
  console.log('🚀 Server is running on port 3000');
});