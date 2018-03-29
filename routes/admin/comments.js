const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');

router.all('/*', (req, res, next) => {
  req.app.locals.layout = 'admin';
  next();
});

router.get('/', (req, res) => {
  Comment.find({ user: req.user.id })
  // Comment.find({ user: '5ab9d8e34912ba060454baa2' })
    .populate('user')
    .then(comments => {
      res.render('admin/comments', { comments });
    })
    .catch(err => console.log(err));
});

router.post('/', (req, res) => {
  Post.findById(req.body.id).then(post => {
    const newComment = new Comment({
      user: req.user.id,
      body: req.body.body
    });

    post.comments.push(newComment);
    post.save().then(savedPost => {
      newComment.save().then(savedComment => {
        req.flash('success_message', 'Comment created. Comment will be visible after review.');
        res.redirect(`/post/${post.id}`);
      });
    });
  });
});

router.delete('/:id', (req, res) => {
  Comment.findByIdAndRemove(req.params.id).then(deletedPost => {
    Post.findOneAndUpdate(
      { comments: req.params.id },
      { $pull: { comments: req.params.id } },
      (err, data) => {
        if (err) console.log(err);
        res.redirect('/admin/comments');
      }
    );
  });
});

router.post('/approve-comment', (req, res) => {
  Comment.findByIdAndUpdate(req.body.id, {
    $set: { approveComment: req.body.approveComment }
  })
    .then(result => {
      res.send(result);
    })
    .catch(err => console.log(err));
});

module.exports = router;
