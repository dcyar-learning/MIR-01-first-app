const express = require('express')
const mongoose = require('mongoose')
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt')
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

  if(!user) return null

  // si existe comparamos la contraseña
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) reject(err);
      resolve(result === true ? user : null);
    });
  });
};

const User = mongoose.model('User', userSchema)

app.set('view engine', 'pug')
app.set('views', 'views')

app.use(express.urlencoded({ extended: true }))
app.use(cookieSession({
  secret: process.env.COOKIE_SECRET || 'secret',
  maxAge: 24 * 60 * 60 * 1000
}))

const requireUser = async (req, res, next) => {
  const userId = req.session.userId;

  if (userId) {
    const user = await User.findOne({ _id: userId });
    res.locals.user = user;
    next();
  } else {
    return res.redirect("/login");
  }
}

app.get('/', requireUser, async (req, res) => {
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

app.get('/login', (req, res) => {
  res.render('login-form')
})

app.post('/login', async (req, res, next) => {
  const { email, password } = req.body

  try {
    const user = await User.authenticate(email, password)
    
    if(!user) throw new Error('Wrong email or password. Try again!')
    
    req.session.userId = user._id

    res.redirect('/')
  } catch (err) {
    res.render('login-form', {
      error: err.message
    })
  }
})

app.get('/register', (req, res) => {
  res.render('register-form')
})

app.post('/register', async (req, res) => {
  const {name, email, password} = req.body

  try {
    const user = new User({
      name,
      email,
      password: await bcrypt.hash(password, 10)
    })

    await user.save()

    res.redirect('/')
  } catch (err) {
    res.status(500).send(err.message)
  }
})

app.get('/logout', (req, res) => {
  req.session = null
  res.redirect('/login')
})

app.listen(3000, () => console.log('Listening on port 3000!'));