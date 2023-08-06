const express = require('express');
const app = express();

import './database';

app.use(express.json());

// Import routes
import loginRoute from './routes/login';
import slotsRoute from './routes/slots';

// Use routes
app.use('/login', loginRoute);
app.use('/slots', slotsRoute);

// Start the server
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
