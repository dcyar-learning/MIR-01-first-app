const express = require('express')
const mongoose = require('mongoose');
const { restart } = require('nodemon');
const app = express()
require('dotenv').config()

mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/mongo-1', { useNewUrlParser: true });

mongoose.connection.on('error', (err) => console.log(err))

const userSchema = mongoose.Schema({
  name: mongoose.Schema.Types.String,
  email: mongoose.Schema.Types.String,
  password: mongoose.Schema.Types.String,
})

const User = mongoose.model('User', userSchema)

app.set('view engine', 'pug')
app.set('views', 'views')

app.use(express.urlencoded({ extended: true }))

app.get('/', async (req, res) => {
  try {
    const users = await User.find()

    if(!users) new Error('No existen los usuarios')

    res.render('home', {
      users
    })
  } catch (err) {
    res.status(500).send(err.message)
  }
});

app.post('/', async (req, res) => {
  const {name, email, password} = req.body

  try {
    const user = new User({
      name,
      email,
      password
    })

    await user.save()

    res.redirect('/')
  } catch (err) {
    res.status(500).send(err.message)
  }
})

app.get('/register', (req, res) => {
  res.render('form')
})

app.listen(3000, () => console.log('Listening on port 3000!'));