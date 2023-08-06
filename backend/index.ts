const express = require('express');
const app = express();

app.use(express.json());

// Import routes
import loginRoute from './routes/login';

// Use routes
app.use('/login', loginRoute);

// Start the server
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
