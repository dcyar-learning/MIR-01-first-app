const express = require('express')
const mongoose = require('mongoose')
const app = express()
require('dotenv').config()

mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/mongo-1', { useNewUrlParser: true })

mongoose.connection.on('error', (err) => console.log(err))

const productSchema = mongoose.Schema({
  name: mongoose.Schema.Types.String,
  email: mongoose.Schema.Types.String,
  password: mongoose.Schema.Types.String,
})

productSchema.statics.authenticate = async (email, password) => {
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

const Product = mongoose.model('Product', productSchema)

app.get('/products', async (req, res) => {
  try {
    const products = await Product.find()

    if(!products) new Error('No existen los productos')

    res.status(200).json(products)
  } catch (err) {
    res.status(500).json({
      message: err.message || 'Algo salio mal'
    })
  }
});

app.listen(3000, () => console.log('Listening on port 3000!'));