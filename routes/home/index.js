const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

router.all('/*', (req, res, next) => {
  req.app.locals.layout = 'home';
  next();
});

router.get('/', (req, res) => {
  const perPage = 10;
  const page = req.query.page || 1;

  Post.find({})
    .skip(perPage * page - perPage)
    .limit(perPage)
    .then(posts => {
      Post.count().then(postCount => {
        Category.find({}).then(categories => {
          res.render('home/index', {
            posts,
            categories,
            current: parseInt(page),
            pages: Math.ceil(postCount / perPage)
          });
        });
      });
    })
    .catch(err => console.log(err));
});

router.get('/about', (req, res) => {
  res.render('home/about');
});

router.get('/login', (req, res) => {
  res.render('home/login');
});

// App Login
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email'
    },
    (email, password, done) => {
      User.findOne({ email }).then(user => {
        if (!user)
          return done(null, false, {
            message: 'No user found'
          });

        bcrypt.compare(password, user.password, (err, matched) => {
          if (err) return err;
          if (matched) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Incorrect password.' });
          }
        });
      });
    }
  )
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logOut();
  res.redirect('/login');
});

router.get('/register', (req, res) => {
  res.render('home/register');
});

router.post('/register', (req, res) => {
  const { firstname, lastname, email, password, passwordConfirm } = req.body;

  let errors = [];
  if (!req.body.firstname) {
    errors.push({ message: 'Please enter your firstname' });
  }

  if (!req.body.lastname) {
    errors.push({ message: 'Please add a lastname' });
  }

  if (!req.body.email) {
    errors.push({ message: 'Please add an email' });
  }

  if (!req.body.password) {
    errors.push({ message: 'Please enter a password' });
  }

  if (!req.body.passwordConfirm) {
    errors.push({ message: 'Please confirm your password' });
  }

  if (req.body.password !== req.body.passwordConfirm) {
    errors.push({ message: 'Passwords do not match' });
  }

  if (errors.length > 0) {
    res.render('home/register', {
      errors,
      firstname,
      lastname,
      email
    });
  } else {
    User.findOne({ email }).then(user => {
      if (user) {
        req.flash(
          'error_message',
          'Email already exists. Please use a different email'
        );
        res.redirect('/login');
      } else {
        const newUser = new User({
          firstname,
          lastname,
          email,
          password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            newUser.password = hash;
            newUser
              .save()
              .then(createdUser => {
                req.flash('success_message', 'You are now registered!');
                res.redirect('/admin');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

router.get('/post/:slug', (req, res) => {
  Post.findOne({ slug: req.params.slug })
    .populate({
      path: 'comments',
      match: { approveComment: true },
      populate: { path: 'user', model: 'users' }
    })
    .populate('user')
    .then(post => {
      console.log(post);
      Category.find({})
        .then(categories => {
          res.render('home/post', { post, categories });
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
});

module.exports = router;
