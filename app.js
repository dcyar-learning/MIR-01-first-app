const express = require('express')
const app = express()

app.get('/makers/:nombre', (req, res) => {
  const [first, ...rest] = req.params.nombre;

  res.send(`<h1>Hola ${first.toUpperCase() + rest.join('')}!</h1>`);
});

app.listen(3000, () => console.log('Listening on port 3000!'));