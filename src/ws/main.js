const express = require('express');
const app = express();

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.use("/", express.static('src/frontend'));
app.use('/images', express.static('res/images'));
app.use("/pixi", express.static('node_modules/pixi.js/dist/'));

// app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));