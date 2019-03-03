/*
*
*
*       Complete the API routing below
*
*
*/
'use strict';
var expect = require('chai').expect;
var MongoClient = require('mongodb');
const mongoose = require('mongoose');
const ObjectIdSchema = mongoose.Schema.Types.ObjectId;
const ObjectId = mongoose.Types.ObjectId;
const Schema = mongoose.Schema;
const projectSchema = new Schema({
  name: String,
  issues: [{type: ObjectIdSchema, ref: 'Issue'}], 
})
const Project = mongoose.model('Project', projectSchema);
const issueSchema = new Schema({
  project: {type: ObjectIdSchema, ref: 'Project'},
  issue_title: String,
  issue_text: String,
  created_by: String, 
  assigned_to: String,
  status_text: String,
  created_on: Date,
  updated_on: Date,
  open: Boolean,
  _id: ObjectId,
})
const Issue = mongoose.model('Issue', issueSchema);
const options = {};
mongoose.connect(process.env.DB, options);
module.exports = function (app) {
  app.route('/api/issues/:project')
    .get(function (req, res){
    let project_name = req.params.project;
    Project.find({name:project_name},(err, projects)=>{
      if (err){return res.json(err)};
      let project = projects[0];
      let search = req.query;
      search.project = project._id;
      Issue.find(search, (err, issues)=>{
        if (err){return res.json(err)};
        return res.json(issues);
      })
    })
  })
    .post(function (req, res, next){
    if(!(req.body.issue_title && req.body.issue_text && req.body.created_by)){
      return res.json({error: "Some required fields left blank"})};
    let project_name = req.params.project;
    let issue = new Issue({
      _id: new ObjectId(),
      issue_title: req.body.issue_title,
      issue_text: req.body.issue_text,
      created_on: new Date(),
      updated_on: new Date(),
      created_by: req.body.created_by, 
      assigned_to: req.body.assigned_to ? req.body.assigned_to : "",
      open: true,
      status_text: req.body.status_text ? req.body.status_text : "",
    });
    // let _id: ObjectId,
    Project.find({name: project_name}, (err, projects)=>{
      if (projects.length){
        let project = projects[0];
        issue.project = project;
        project.issues.push(issue);
        project.save();
        issue.save();
      } else {
        let project = new Project({name: project_name});
        issue.project = project;
        project.issues.push(issue);
        project.save();
        issue.save();
      }
      res.json(issue);
    })
  })
    .put(function (req, res){
    if (!req.body.issue_title && !req.body.issue_text && !req.body.created_by && !req.body.assigned_to && !req.body.open && !req.body.status_text){
      return res.json({error: "no updated fields sent"})};
    let project_name = req.params.project;
    let _id = req.body._id;
    let update = {};
    req.body.issue_title ? update.issue_title = req.body.issue_title : "";
    req.body.issue_text ? update.issue_text = req.body.issue_text : "";
    update.updated_on = new Date();
    req.body.created_by ? update.created_by = req.body.created_by : ""; 
    req.body.assigned_to ? update.assigned_to = req.body.assigned_to : "";
    req.body.open ? update.open = false : "";
    req.body.status_text ? update.status_text = req.body.status_text : "";
    Project.find({name: project_name}, (err, projects)=>{
      if (projects.length){
        let project_id = projects[0]._id;
        Issue.findOneAndUpdate({project: project_id, _id: _id}, update, (err, issue)=>{
          if(err){return res.json({error: err})}
          return (res.json({message: "successfully updated"}))
        })
      }
    })
  })
    .delete(function (req, res){
    let project_name = req.params.project;
    if (!req.body._id){return res.json({error: "_id error"})}
    let _id = req.body._id;
    Issue.findByIdAndDelete(_id, (err, issue)=>{
      if(err){return res.json({error: err})};
      Project.findOne({name: project_name}, (err, project)=>{
        if(err){return res.json({error:err})};
        let index = project.issues.indexOf(_id);
        if (index > -1){project.issues.splice(index, 1)};
        project.save();
        return res.json({message: `deleted ${_id}`});
      })
    })
  }
           )}
