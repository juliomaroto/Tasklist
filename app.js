var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var connect = require('connect');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var mongoose = require('mongoose');
var session = require('express-session');

mongoose.connect('mongodb://localhost/tareas', function(err) {
  if(!err) {
    console.log('Connected to MongoDB');
  } else {
    throw err;
  }
});
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var Task = new Schema({
  task: String,
  details: String
});

var Task = mongoose.model('Task', Task);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use(flash());
app.use(cookieParser());
app.use(session({
      secret: 'OZhCLfxlGp9TtzSXMJtq',
      resave: false,
      saveUninitialized: true }));

app.use('/', routes);
app.use('/users', users);



app.get('/tasks', function(req, res) {
  Task.find({}, function (err, docs) {
    res.render('tasks/index', {
      title: 'Todos index view',
      docs: docs
    });
  });
});

app.get('/tasks/new', function(req, res){
  res.render('tasks/new.jade', {
    title: 'New Task'
  });
});

app.get('/tasks/:id/edit', function(req, res) {
  Task.findById(req.params.id, function(err, doc) {
    if(!err) {
      res.render('tasks/edit.jade', {
       title: 'Edit Task View',
       task: doc})
    }
  });
});

app.post('/tasks', function(req, res){
  var task = new Task(req.body);
  task.save(function (err) {
    if (!err) {
      req.flash('info', 'Tarea creada con éxito.');
      res.redirect('/tasks');
    }
    else {
      res.send(req.flash('warning', err));
      res.redirect('/tasks/new');
    }
  });
});

app.put('/tasks/:id', function(req, res){
  Task.findById(req.params.id, function (err, doc){
    doc.task = req.body.task;
    doc.details = req.body.details;
    doc.save(function(err) {
      if (!err){
        res.redirect('/tasks');
      }
      else {
        throw err;
      }
    });
  });
});

app.delete('/tasks/:id', function(req, res) {
  Task.findById(req.params.id, function(err, doc) {
    if(!doc) return next(new NotFount('Document not found'));
    doc.remove(function() {
      res.redirect('/tasks');
    });
  });
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
