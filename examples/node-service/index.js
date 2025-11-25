import './tracing.js';
import express from 'express';
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello from ObservaX Node.js service!');
});

app.listen(port, () => {
  console.log(`Node.js service listening on port ${port}`);
});
