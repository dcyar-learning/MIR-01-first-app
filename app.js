const express = require('express')
const app = express()

app.get('/', (req, res) => {
  let message = '';

  for (let i = 1; i <= 50; i++) {
    message += '<p>';
    message += (i % 2 === 0) ? `${i} Soy Par!` : `${i} Soy Impar!`;
    message += '</p>';
  }

  res.send(message);
});

app.listen(3000, () => console.log('Listening on port 3000!'));