const expect = require('chai').expect;
const sinon = require('sinon');
const mongoose = require('mongoose');

const User = require('../models/user');
const FeedController = require('../controller/feed');

describe('Feed Controller', function () {
  before(function (done) {
    const MONGOOSE_URI =
      'mongodb+srv://saman:930957S.f@cluster0.nkbt7xy.mongodb.net/test-messages?appName=Cluster0';
    mongoose
      .connect(MONGOOSE_URI)
      .then((result) => {
        const user = new User({
          email: 'test@test.com',
          password: 'tester',
          name: 'test',
          posts: [],
          _id: '5c0f66b979af55031b34728a',
        });
        return user.save();
      })
      .then(() => {
        done();
      });
  });
  it('should add a created post to the posts of the creator.', function (done) {
    const req = {
      body: {
        title: 'test post',
        content: 'A test post',
      },
      file: {
        path: 'abc',
      },
      userId: '5c0f66b979af55031b34728a',
    };

    const res = {
      status: function () {
        return this;
      },
      json: function () {},
    };

    FeedController.createPost(req, res, () => {}).then((savedUser) => {
      expect(savedUser).to.have.property('posts');
      expect(savedUser.posts).to.have.length(1);
      done();
    });
  });

  it('should send a response with valid user status for an existing user', function (done) {
    const req = { userId: '5c0f66b979af55031b34728a' };
    const res = {
      statusCode: 500,
      userStatus: null,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.userStatus = data.status;
      },
    };
    AuthController.getUserStatus(req, res, () => {}).then(() => {
      expect(res.statusCode).to.be.equal(200);
      expect(res.userStatus).to.be.equal('I am new!');
      done();
    });
  });

  after(function (done) {
    User.deleteMany({})
      .then(() => {
        return mongoose.disconnect();
      })
      .then(() => {
        done();
      });
  });
});
