const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const app = express()
require('dotenv').config()

mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/mongo-1', { useNewUrlParser: true })

mongoose.connection.on('error', (err) => console.log(err))

const userSchema = mongoose.Schema({
  name: mongoose.Schema.Types.String,
  email: mongoose.Schema.Types.String,
  password: mongoose.Schema.Types.String,
})

userSchema.statics.authenticate = async (email, password) => {
  const user = await mongoose.model('User').findOne({ email });

  if (!user) return null

  return new Promise((resolve, reject) => {
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) reject(err);
      resolve(result === true ? user : null);
    });
  });
};

const User = mongoose.model('User', userSchema)

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.post('/register', async (req, res) => {
  console.log(req.body.email);
  try {
    const isEmailExist = await User.findOne({ email: req.body.email })

    if (isEmailExist) {
      return res.status(400).json(
        { error: 'Email ya registrado' }
      )
    }

    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 10),
    })

    res.status(201).json({
      message: 'Usuario creado, inicia sesión para continuar'
    })
  } catch (err) {
    res.status(500).json({
      message: err.message || 'Algo salio mal'
    })
  }
})

app.post('/login', async (req, res) => {

  try {
    const user = await User.authenticate(req.body.email, req.body.password)

    if (!user) throw new Error('Wrong email or password. Try again!')

    const token = jwt.sign({
      email: user.email,
      id: user._id
    }, process.env.SECRET_KEY, { expiresIn: '1h' })

    res.header('auth-token', token)
      .status(200)
      .json({
        message: 'Bienvenido',
        token: token,
        data: {
          name: user.name,
          email: user.email
        }
      })
  } catch (err) {
    res.status(500).json({
      message: err.message || 'Algo salio mal'
    })
  }
});

app.listen(3000, () => console.log('Listening on port 3000!'));