/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var partials = require('express-partials'); // express 3.x不支持ejs的layout
var flash = require('connect-flash');
// MongoDB新版本写法，与书中例子不同
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');

var app = express();

// Configuration
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(flash());
  app.use(partials()); // express 3.x不支持ejs的layout
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: settings.cookieSecret,
    store: new MongoStore({
      db: settings.db
    })
  }));
  
  app.use(function(req, res, next) {
    res.locals.error = req.flash('error').toString();
    res.locals.success = req.flash('success').toString();
    res.locals.user = req.session ? req.session.user : null;
    next();
  });
  
  app.use(app.router);
  routes(app);  // http://blog.ownlinux.net/learn-nodejs-dev.html
  app.use(express.static(__dirname + '/public'));  
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port %d", app.get('port'));
});
