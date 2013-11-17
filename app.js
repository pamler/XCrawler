/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var partials = require('express-partials'); // NodeJS 3.x不支持ejs的layout
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
  app.use(partials()); // NodeJS 3.x不支持ejs的layout
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: settings.cookieSecret,
    store: new MongoStore({
      db: settings.db
    })
  }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  
  app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  });

  app.configure('production', function(){
	app.use(express.errorHandler());
  });
  
  //dynamicHelper Nodejs 3.x不支持
  app.use(function(req, res, next){
    var err = req.flash('error'),
        success = req.flash('success');
    res.locals.user = req.session.user;
    res.locals.error = err.length ? err : null;
    res.locals.success = success.length ? success : null;
    next();
  });
});


routes(app);  // http://blog.ownlinux.net/learn-nodejs-dev.html

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port %d", app.get('port'));
});
