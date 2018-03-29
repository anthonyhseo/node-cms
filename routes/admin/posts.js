const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const { isEmpty, uploadDir } = require('../../helpers/upload-helper');
const fs = require('fs');
const path = require('path');
const { userAuthenticated } = require('../../helpers/authentication');

router.all('/*', (req, res, next) => {
  req.app.locals.layout = 'admin';
  next();
});

router.get('/', (req, res) => {
  Post.find({})
    .populate('category')
    .then(posts => {
      res.render('admin/posts', { posts });
    })
    .catch(err => console.log(err));
});

router.get('/my-posts', (req, res) => {
  Post.find({ user: req.user.id })
    .populate('category')
    .then(posts => {
      res.render('admin/posts/my-posts', { posts });
    })
    .catch(err => console.log(err));
});

router.get('/create', (req, res) => {
  Category.find({}).then(categories => {
    res.render('admin/posts/create', { categories });
  });
});

router.post('/create', (req, res) => {
  let errors = [];
  if (!req.body.title) {
    errors.push({ message: 'Please add a title' });
  }

  if (!req.body.body) {
    errors.push({ message: 'Please add a description' });
  }

  if (errors.length > 0) {
    res.render('admin/posts/create', {
      errors
    });
  } else {
    let filename = '';
    if (!isEmpty(req.files)) {
      let file = req.files.file;
      filename = Date.now() + '-' + file.name;

      file.mv('./public/uploads/' + filename, err => {
        if (err) throw err;
      });
      console.log(filename);
    }

    const { title, status, body, category } = req.body;
    const allowComments = req.body.allowComments === 'on' ? true : false;
    const user = req.user.id;

    const newPost = new Post({
      user,
      title,
      status,
      allowComments,
      body,
      category,
      file: filename
    });

    newPost
      .save()
      .then(savedPost => {
        req.flash('success_message', `Post: ${savedPost.title} created`);
        res.redirect('/admin/posts');
      })
      .catch(error => {
        console.log(error);
      });
  }
});

router.get('/edit/:id', (req, res) => {
  Post.findById(req.params.id)
    .then(post => {
      Category.find({}).then(categories => {
        res.render('admin/posts/edit', { post, categories });
      });
    })
    .catch(err => console.log(err));
});

router.put('/edit/:id', (req, res) => {
  const { title, status, body, category } = req.body;
  const allowComments = req.body.allowComments === 'on' ? true : false;
  const user = req.user.id;
  let { file } = req.body;

  if (!isEmpty(req.files)) {
    let file_temp = req.files.file;
    filename = Date.now() + '-' + file_temp.name;
    file = filename;

    file_temp.mv('./public/uploads/' + filename, err => {
      if (err) throw err;
    });
    console.log(filename);
  } else {
    file = '';
  }

  Post.findByIdAndUpdate(req.params.id, {
    user,
    title,
    status,
    body,
    allowComments,
    category,
    file
  })
    .then(post => {
      req.flash('success_message', 'Post successfully updated');
      res.redirect('/admin/posts/my-posts');
    })
    .catch(err => console.log(err));
});

router.delete('/:id', (req, res) => {
  Post.findByIdAndRemove(req.params.id)
    .populate('comments')
    .then(post => {
      fs.unlink(uploadDir + post.file, err => {
        if (!post.comments < 1) {
          post.comments.forEach(comment => {
            comment.remove();
          });
        }

        if (err) console.log(err);
        req.flash('success_message', 'Post deleted');
        res.redirect('/admin/posts/my-posts');
      });
    })
    .catch(err => console.log(err));
});

module.exports = router;
