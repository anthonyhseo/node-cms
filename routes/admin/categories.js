const express = require('express');
const router = express.Router();
const Category = require('../../models/Category');
const { userAuthenticated } = require('../../helpers/authentication');


const Post = require('../../models/Post');

router.all('/*', userAuthenticated, (req, res, next) => {
  req.app.locals.layout = 'admin';
  next();
});

router.get('/', (req, res) => {
  Category.find({}).then(categories => {
    res.render('admin/categories/index', { categories });
  });
});

router.post('/create', (req, res) => {
  const newCategory = new Category({
    name: req.body.name
  });

  newCategory.save().then(savedCategory => {
    res.redirect('/admin/categories');
  });
});

router.get('/edit/:id', (req, res) => {
  Category.findById(req.params.id)
    .then(category => {
      res.render('admin/categories/edit', { category });
    })
    .catch(err => console.log(err));
});

router.delete('/:id', (req, res) => {
  Category.findByIdAndRemove(req.params.id)
    .then(result => {
      res.redirect('/admin/categories');
    })
    .catch(err => console.log(err));
});

module.exports = router;
