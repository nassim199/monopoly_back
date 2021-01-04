const express = require('express');
const bodyParser = require('body-parser');

const gameRoutes = require('./routes/game');
const authRoutes = require('./routes/auth');

//const mongoConnect = require('./util/database').mongoConnect;
const mongoose = require('mongoose');

app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });
  
app.use('/auth', authRoutes);
app.use('/game', gameRoutes);

app.use((req, res) => {
    return res
});


mongoose.connect("mongodb+srv://nassim199:Nasim_201@cluster0.2xoat.mongodb.net/monopoly?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("app running");
    const server = app.listen(3000);
    require('./socket').init(server);
  })
  .catch((err) => {
    console.log("error in the mongo db connection");
    console.log(err);
  });