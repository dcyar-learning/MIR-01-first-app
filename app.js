const express = require('express')
const mongoose = require('mongoose')
const app = express()
require('dotenv').config()

mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/mongo-1', { useNewUrlParser: true });

mongoose.connection.on('error', (err) => console.log(err))

const visitorSchema = mongoose.Schema({
  name: mongoose.Schema.Types.String,
  count: mongoose.Schema.Types.Number
})

const Visitor = mongoose.model('Visitor', visitorSchema)

app.set('view engine', 'pug')
app.set('views', 'views')

app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    const {name = 'Anónimo'} = req.query

    Visitor.findOne({name}, (err, visitor) => {
      if (err) return console.log(err)

      if (visitor && name !== 'Anónimo') {
        visitor.count++
        visitor.save()
      } else {
        Visitor.create({name, count: 1})
      }
    })

    Visitor.find({}, (err, visitors) => {
      if (err) return console.log(err)

      res.render('home', {
        visitors
      })
    })
  });

app.listen(3000, () => console.log('Listening on port 3000!'));