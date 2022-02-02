const express = require('express')
const app = express()

app.set('view engine', 'pug')
app.set('views', 'views')

app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => res.render('form'))
app.post('/', (req, res) => {
  const {name} = req.body

  res.render('home', {name})
})

app.listen(3000, () => console.log('Listening on port 3000!'));