const mongoose = require('mongoose')
const express = require('express')
const app = express()
require('dotenv').config()

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true})

mongoose.connection.on('error', (err) => console.log(err))

const visitorSchema = mongoose.Schema({
  date: mongoose.Schema.Types.Date,
  name: mongoose.Schema.Types.String,
})

const Visitor = mongoose.model('Visitor', visitorSchema)

app.set('view engine', 'pug')
app.set('views', 'views')

app.use(express.urlencoded({ extended: true }))

app.route('/')
  .get((req, res) => {
    const {name = 'Anónimo'} = req.query

    Visitor.create({
      name,
      date: new Date()
    })

    res.send('El visitante fue almacenado con éxito')
  })
  .post((req, res) => {
    const {name} = req.body

    res.render('home', {name})
  })

app.listen(3000, () => console.log('Listening on port 3000!'));