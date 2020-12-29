const express = require('express');
const bodyParser = require('body-parser');

const gameRoutes = require('./routes/game');

app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });
  
app.use(gameRoutes);

app.use((req, res) => {
    return res
});

app.listen(3000);