import mongoose from 'mongoose';

// Connect to the database
mongoose.connect('mongodb://127.0.0.1:27017/SlotManagement', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as mongoose.ConnectOptions).then(() => {
  console.log('Database connection established');

  // Additional code to be executed after database connection
}).catch(error => {
  console.error('Error connecting to database:', error);
});

const db = mongoose.connection;
db.once('open', () => {
  console.log('Database connection is open');
});
