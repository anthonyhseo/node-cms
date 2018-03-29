const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const upload = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');

const { mongoDbUrl } = require('./config/database');

const app = express();

// Upload Middleware
app.use(upload());

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Method Override
app.use(methodOverride('_method'));

mongoose
  .connect(mongoDbUrl)
  .then(db => {
    console.log('connected to mongoDB database');
  })
  .catch(err => console.log(err));

app.use(express.static(path.join(__dirname, 'public')));

const { select, generateTime, paginate } = require('./helpers/handlebars-helpers');

// Set View Engines
app.engine(
  'handlebars',
  exphbs({ defaultLayout: 'home', helpers: { select, generateTime, paginate } })
);
app.set('view engine', 'handlebars');

app.use(session({
  secret: 'abc123',
  resave: true,
  saveUninitialized: true
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// Local variables using middleware
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.success_message = req.flash('success_message');
  res.locals.error_message = req.flash('error_message');
  res.locals.error = req.flash('error');
  next();
})

// Load Routes
const home = require('./routes/home/index');
const admin = require('./routes/admin/index');
const posts = require('./routes/admin/posts');
const categories = require('./routes/admin/categories');
const comments = require('./routes/admin/comments');

// Use Routes
app.use('/', home);
app.use('/admin', admin);
app.use('/admin/posts', posts);
app.use('/admin/categories', categories);
app.use('/admin/comments', comments);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on Port ${port}`);
});
