require('dotenv').config()
const express = require('express');
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const session = require('express-session')
const productsController = require('./controllers/ProductsController')
const productRatingController = require('./controllers/ProductRatingController')
const usersController = require('./controllers/UsersController')
const app = express();
const port = 5000;

// console.log(process.env.DB_USER)
const mongoURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}`
mongoose.set('useFindAndModify', false)

// set template to use
app.set('view engine', 'ejs')
// tell Express app where to find our static assets
// there's no need to add a public infront of css in partials/header
app.use(express.static('public'))
// tell Express app to make use of the imported method-override library
app.use(methodOverride('_method'))
app.use(express.urlencoded({
  extended: true
}))
app.use(session({
  secret: process.env.SESSION_SECRET,
  name: "app_session",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 3600000 } // 3600000ms = 3600s = 60mins, cookie expires in an hour
})) // secure: true is only for secure webpages (SSL)
app.use(setUserVarMiddleware)
/**
 * PRODUCTS ROUTES
 */

// index route
app.get('/products', productsController.listProducts)

// new route
app.get('/products/new', productsController.newProduct)

// show route
app.get('/products/:slug', productsController.showProduct)

// create route
app.post('/products', productsController.createProduct)

// edit route 
app.get('/products/:slug/edit', productsController.showEditForm)

// update route
app.patch('/products/:slug', productsController.updateProduct)

//delete route
app.delete('/products/:slug', productsController.deleteProduct)

/**
 * PRODUCT RATINGS ROUTES
 */

// product rating new route 
app.get('/products/:slug/ratings/new', productRatingController.newProductRatingForm)

// product rating create route
app.post('/products/:slug/ratings', productRatingController.createProductRating)

/**
 * USER ON-BOARDING ROUTES
 */

// user registration form route
app.get('/users/register', guestOnlyMiddleware, usersController.showRegistrationForm)

// user registration
app.post('/users/register', guestOnlyMiddleware, usersController.register)

// user login form route
app.get('/users/login', guestOnlyMiddleware, usersController.showLoginForm)

// user login route
app.post('/users/login', guestOnlyMiddleware, usersController.login)

/**
 * USER-ONLY ROUTES
 */

// user dashboard
app.get('/users/dashboard', authenticatedOnlyMiddleware, usersController.dashboard)

// user logout
app.post('/users/logout', authenticatedOnlyMiddleware, usersController.logout)

// connect to DB, then inititate Express app
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(response => {
    // DB connected successfully
    console.log('DB connection successful')

    app.listen(process.env.PORT || port, () => {
      console.log(`Biscoff Bakery app listening on port: ${port}`)
    })
  })
  .catch(err => {
    console.log(err)
  })

function guestOnlyMiddleware(req, res, next) {
  // check if user is logged in, 
  // if logged in. redirect back to dashboard
  if (req.session && req.session.user) {
    res.redirect('/users/dashboard')
    return // it works without return as well
  }
  next()

}
function setUserVarMiddleware(req, res, next) {
  // default user template variable
  res.locals.user = null

  // check if req.session.user is set, 
  // if set, template user var will be set as well
  if (req.session && req.session.user) {
    res.locals.user = req.session.user
  }
  next()
}

function authenticatedOnlyMiddleware(req, res, next) {
  if (!req.session || !req.session.user) {
    res.redirect('/users/login')
    return
  }
  next()
}

