const express = require('express');
const route = require('./routes/index');

const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());

app.use('/', route);

app.listen(port, () => {
  console.log(`App is running at port ${port}`);
});

module.exports = app;
