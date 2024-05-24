require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const userRoute = require('./routes/auth');
const todoRoute=require('./routes/todo')

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET; 
app.use(cors());
app.use(bodyParser.json());


mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log("Connected to db"))
  .catch((err) => console.log(err));

app.use('/', userRoute); 
app.use('/todos', todoRoute);







app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
