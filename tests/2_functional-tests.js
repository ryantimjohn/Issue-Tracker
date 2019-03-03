/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/
var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
chai.use(chaiHttp);
const clean_up = (id, done)=>{
  chai.request(server)
    .delete('/api/issues/test')
    .send({
    _id: id
  }).end((err, res, next)=>{
    if(err){return console.log(err)};
    assert.equal(res.body.message, 'deleted '+id); 
    done();
  });  
}
const create_issue = (callback)=>{
  chai.request(server)
    .post('/api/issues/test')
    .send({
    issue_title: 'Title',
    issue_text: 'text',
    created_by: 'Functional Test - Every field filled in',
    assigned_to: 'Chai and Mocha',
    status_text: 'In QA'
  }).then(callback)
    .catch((err)=>{
    console.error(err);
    throw err; 
  })
}
suite('Functional Tests', function() {
  suite('POST /api/issues/{project} => object with issue data', function() {
    test('Every field filled in', function(done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({
        issue_title: 'Title',
        issue_text: 'text',
        created_by: 'Functional Test - Every field filled in',
        assigned_to: 'Chai and Mocha',
        status_text: 'In QA'
      })
        .end(function(err, res){
        if(err){return console.log(err)};
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Title');
        assert.equal(res.body.issue_text, 'text');
        assert.equal(res.body.created_by, 'Functional Test - Every field filled in')
        assert.equal(res.body.assigned_to, 'Chai and Mocha')
        assert.equal(res.body.status_text, 'In QA');
        let id = res.body._id;
        clean_up(id, done);
      });       
    }) 
    test('Required fields filled in', function(done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({
        issue_title: 'Title',
        issue_text: 'text',
        created_by: 'Functional Test - Required filled in',
      })
        .end((err, res)=>{
        if(err){return console.log(err)};
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Title');
        assert.equal(res.body.issue_text, 'text');
        assert.equal(res.body.created_by, 'Functional Test - Required filled in')
        assert.equal(res.body.assigned_to, '')
        assert.equal(res.body.status_text, '');
        let id = res.body._id;
        clean_up(id, done);
      })
    }); 
    test('Missing required fields', function(done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({
        created_by: 'Functional Test - Required fields missing',
      })
        .end((err, res)=>{
        if(err){return console.log(err)};
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "Some required fields left blank");
        done(); 
      })
    });
  });
  suite('PUT /api/issues/{project} => text', function() {
    test('No body', function(done) {
      create_issue(function(result){
        var _id =  result.body._id;
        chai.request(server)
          .put('/api/issues/test')
          .send({_id: _id})
          .end((err, res)=>{
          if(err){return console.log(err)};
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "no updated fields sent")
          clean_up(_id, done);
        })  
      })
    });
    test('One field to update', function(done) {
      create_issue(function(result){
        var _id =  result.body._id;
        chai.request(server)
          .put('/api/issues/test')
          .send({
          _id: _id,
          issue_title: 'New Title',
        })
          .end((err, res)=>{
          if(err){return console.log(err)};
          assert.equal(res.status, 200);
          assert.equal(res.body.message, "successfully updated");
          clean_up(_id, done);
        })  
      })
    });
    test('Multiple fields to update', function(done) {
      create_issue(function(result){
        var _id =  result.body._id;
        chai.request(server)
          .put('/api/issues/test')
          .send({
          _id: _id,
          issue_title: 'New Title',
          issue_text: 'new text',
          created_by: 'New Functional Test - Every field filled in',
          assigned_to: 'New Chai and Mocha',
          status_text: 'New In QA'
        })
          .end((err, res)=>{
          if(err){return console.log(err)};
          assert.equal(res.status, 200);
          assert.equal(res.body.message, "successfully updated");
          clean_up(_id, done); 
        })  
      })
    });
  });
  suite('GET /api/issues/{project} => Array of objects with issue data', function() {
    test('No filter', function(done) {
      chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.property(res.body[0], 'issue_title');
        assert.property(res.body[0], 'issue_text');
        assert.property(res.body[0], 'created_on');
        assert.property(res.body[0], 'updated_on');
        assert.property(res.body[0], 'created_by');
        assert.property(res.body[0], 'assigned_to');
        assert.property(res.body[0], 'open');
        assert.property(res.body[0], 'status_text');
        assert.property(res.body[0], '_id');
        done();
      });
    });
    test('One filter', function(done) {
      create_issue(function(result){
        var _id =  result.body._id;
        chai.request(server)
          .get('/api/issues/test')
          .query({created_by: 'Functional Test - Every field filled in',})
          .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body); 
          assert.equal(res.body[0].created_by, 'Functional Test - Every field filled in');
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          clean_up(_id, done); 
        });
      }
                  )
    });
    test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
      create_issue(function(result){
        var _id =  result.body._id;
        chai.request(server)
          .get('/api/issues/test')
          .query({issue_title: 'Title',
                  issue_text: 'text',
                  created_by: 'Functional Test - Every field filled in',
                  assigned_to: 'Chai and Mocha',
                  status_text: 'In QA'})
          .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body); 
          assert.equal(res.body[0].issue_title, 'Title');
          assert.equal(res.body[0].issue_text, 'text');
          assert.equal(res.body[0].created_by, 'Functional Test - Every field filled in')
          assert.equal(res.body[0].assigned_to, 'Chai and Mocha')
          assert.equal(res.body[0].status_text, 'In QA');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], '_id');
          clean_up(_id, done); 
        });
      });
    });
  });
  suite('DELETE /api/issues/{project} => text', function() {
    test('No _id', function(done) {
      chai.request(server)
        .delete('/api/issues/test')
        .send({})
        .end((err, res)=>{
        if(err){return console.error(err)};
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "_id error");
        done();
      })
    });
    test('Valid _id', function(done) {
      create_issue((result)=>{
        const _id = result.body._id
        chai.request(server)
          .delete('/api/issues/test')
          .send({_id: _id})
          .end((err, res)=>{
          if(err){return console.error(err)}
          assert.equal(res.status, 200)
          assert.equal(res.body.message, `deleted ${_id}`);
          clean_up(_id, done);
        })
      }  
                  )
    });
  });
});
