const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const io = require('../socket');
const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = async (req, res, next) => {
  const { page } = req.query || 1;
  const perPage = 2;
  const count = await Post.find().countDocuments();

  try {
    const posts = await Post.find()
      .populate('creator')
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);

    if (posts.length < 1) {
      const error = new Error('No Post found!');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: 'Posts found sucessfully!',
      posts,
      totalItems: count,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error('No image provided.');
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path.replace('\\', '/');
  const { title, content } = req.body;
  const post = new Post({
    title,
    content,
    imageUrl,
    creator: req.userId,
  });

  try {
    await post.save();

    const user = await User.findById(req.userId);

    user.posts.push(post);
    const savedUser = await user.save();

    io.getIO().emit('posts', {
      action: 'create',
      post: { ...post._doc, creator: { _id: req.userId, name: user.name } },
    });

    res.status(201).json({
      message: 'Post created successfully!',
      post,
      creator: {
        _id: user._id,
        name: user.name,
      },
    });
    return savedUSer;
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getPost = async (req, res, next) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('Couuld not find post.');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: 'Post fetched.',
      post,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.updatePost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }

  const { postId } = req.params;
  const { title, content } = req.body;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path.replace('\\', '/');
  }
  if (!imageUrl) {
    const error = new Error('No file picked!');
    error.statusCode = 422;
    throw error;
  }

  try {
    const post = await Post.findById(postId).populate('creator');
    if (!post) {
      const error = new Error('No post found for updating!');
      error.statusCode = 404;
      throw error;
    }
    if (post.creator._id.toString() !== req.userId) {
      const error = new Error('Unauthorized!');
      error.statusCode = 403;
      throw error;
    }
    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }
    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl;
    const updatedPost = await post.save();

    io.getIO().emit('posts', {
      action: 'update',
      post: updatedPost,
    });

    res.status(200).json({
      message: 'Post updated seccessfully!',
      post: updatedPost,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('No user was found!');
      error.statusCode = 404;
      throw error;
    }
    if (post.creator._id.toString() !== req.userId) {
      const error = new Error('Unauthorized!');
      error.statusCode = 403;
      throw error;
    }
    clearImage(post.imageUrl);
    const deletedPost = await Post.findByIdAndDelete(postId);

    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();

    io.getIO().emit('posts', {
      action: 'delete',
      post: deletedPost,
    });

    res.status(200).json({
      message: 'Deleted post successfully.',
      post: deletedPost,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

const clearImage = (imagePath) => {
  imagePath = path.join(__dirname, '..', imagePath);
  fs.unlink(imagePath, (err) => console.log(err));
};
