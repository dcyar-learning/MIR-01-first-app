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

app.get('/', async (req, res) => {
  const {name = 'Anónimo'} = req.query

  try {
    const visitor = await Visitor.findOne({name})

    if(!visitor) new Error('No existe el visitante')

    if (visitor && name !== 'Anónimo') {
      visitor.count++
      await visitor.save()
    } else {
      await Visitor.create({name, count: 1})
    }

    const visitors = await Visitor.find()

    if(!visitors) new Error('No hay visitantes')

    res.render('home', {
      visitors
    })
  } catch (err) {
    res.status(500).send(err.message)
  }
});

app.listen(3000, () => console.log('Listening on port 3000!'));