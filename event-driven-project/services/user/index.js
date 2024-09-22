const express = require('express');
const mongoose = require('mongoose');
const userController = require('./user-controller');

const app = express();
const PORT = 3003;

mongoose.connect('mongodb://mongodb:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());

app.get('/users', userController.getAllUsers);
app.get('/users/:id', userController.getUserById);
app.post('/users', userController.createUser);
app.put('/users/:id', userController.updateUser);
app.delete('/users/:id', userController.deleteUser);

app.listen(PORT, () => {
  console.log(`User service listening on port ${PORT}`);
});