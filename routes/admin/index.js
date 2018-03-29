const express = require('express');
const router = express.Router();
const faker = require('faker');
const { userAuthenticated } = require('../../helpers/authentication');

const Post = require('../../models/Post');
const Category = require('../../models/Category');
const Comment = require('../../models/Comment');

router.all('/*', (req, res, next) => {
  req.app.locals.layout = 'admin';
  next();
});

router.get('/', (req, res) => {
  const promise = [
    Post.count().exec(),
    Category.count().exec(),
    Comment.count().exec()
  ];

  Promise.all(promise)
    .then(([postCount, categoryCount, commentCount]) => {
      res.render('admin/index', { postCount, categoryCount, commentCount });
    })
    .catch(err => console.log(err));
});

router.post('/generate-fake-posts', (req, res) => {
  // res.send('it works');
  for (let i = 0; i < req.body.amount; i++) {
    let post = new Post({
      title: faker.random.words(),
      status: 'public',
      body: faker.lorem.paragraph(),
      slug: this.title,
      allowComments: faker.random.boolean()
    });

    post
      .save()
      .then(post => {
        console.log(post);
      })
      .catch(err => console.log(err));
  }
  res.redirect('/admin/posts');
});

module.exports = router;
