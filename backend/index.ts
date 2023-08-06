const express = require('express');
const morgan = require('morgan');
const cors = require('cors'); // Import cors
const app = express();

import './database';

app.use(express.json());

// Use morgan middleware for logging
app.use(morgan('dev'));

// Use cors middleware to enable CORS
app.use(cors());

// Import routes
import loginRoute from './routes/login';
import slotsRoute from './routes/slots';
import slotRoute from './routes/slot';

// Use routes
app.use('/login', loginRoute);
app.use('/slots', slotsRoute);
app.use('/slot', slotRoute);

// Start the server
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
