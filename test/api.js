// conversation/test/api.js

require('module-alias/register');
const request = require('supertest');
const app = require('@root/app');
const proctor = require('@test/proctor');
const expect = require('chai').expect;
const TEST_DEVICE = 'HT001-C137';
const helloQuery = {query: 'Hello', deviceId: TEST_DEVICE};

describe('/api/messages', function() {
  describe('POST', function() {
    describe('with a valid request', function() {
      const validRequest = helloQuery;
      it('should 200 with a JSON blob containing a "message" field', function(done) {
        request(app)
          .post('/api/messages')
          .send(validRequest)
          .end(function(err, res) {
            proctor.check(err);
            expect(res.statusCode).to.equal(200);
            expect(res.type).to.equal('application/json');
            expect(res.body).to.have.keys(['message']);
            done();
          });
      });
    });

    describe('with an invalid request', function() {
      const invalidRequest = {question: 'how are ya doc', machine: 'Skynet'};
      it('should 400 with a JSON blob containing an "error" field', function(done) {
        request(app)
          .post('/api/messages')
          .send(invalidRequest)
          .end(function(err, res) {
            expect(res.statusCode).to.equal(400);
            expect(res.body).to.have.keys(['error']);
            expect(res.body).not.to.have.keys(['message']);
            done();
          });
      });
    });
  });
});
