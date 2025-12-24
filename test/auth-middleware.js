const expect = require('chai').expect;
const sinon = require('sinon');
const jwt = require('jsonwebtoken');

const authMiddleware = require('../middleware/is-auth');

describe('Auth middleware', function () {
  it('should throw an error if no authorization header is present.', function () {
    const req = {
      get: function (headerName) {
        return null;
      },
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw(
      'No Authenticated header found, Please attach Authenticated header to the request.'
    );
  });

  it('should throw an error if the authorization header is only one string.', function () {
    const req = {
      get: function (headerName) {
        return 'xyz';
      },
    };

    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });

  it('should throw an error if the token can not be verified', function () {
    const req = {
      get: function (headerName) {
        return 'Bearer xyz';
      },
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });

  it('should yield a userId after decoding the token.', function () {
    const req = {
      get: function (headerName) {
        return 'Bearer xyz';
      },
    };
    sinon.stub(jwt, 'verify');
    jwt.verify.returns({ userId: 'abc' });
    authMiddleware(req, {}, () => {});
    expect(jwt.verify.called).to.be.true;
    expect(req).to.have.property('userId', 'abc');
    jwt.verify.restore();
  });
});
