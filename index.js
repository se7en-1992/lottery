var path = require('path');
var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var config = require('config-lite');
var pkg = require('./package');
var flash = require('connect-flash');
var winston = require('winston');
var expressWinston = require('express-winston');

var app = express();

var indexRouter = require('./routes/index');
var ruleRouter = require('./routes/rule');
var regRouter = require('./routes/reg');
var loginRouter = require('./routes/login');
var resultRouter = require('./routes/result');
var signoutRouter = require('./routes/signout');

app.set('views', path.join(__dirname, 'views'));// 设置存放模板文件的目录
app.set('view engine', 'ejs');// 设置模板引擎为 ejs

app.use(express.static(path.join(__dirname, 'public')));// 设置存放静态文件的目录


// session 中间件
app.use(session({
  name: config.session.key,// 设置 cookie 中保存 session id 的字段名称
  secret: config.session.secret,// 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
  cookie: {
    maxAge: config.session.maxAge// 过期时间，过期后 cookie 中的 session id 自动删除
  },
  store: new MongoStore({// 将 session 存储到 mongodb
    url: config.mongodb// mongodb 地址
  })
}));

// flash 中间件，用来显示通知
app.use(flash());

//表单提交中间件
app.use(require('express-formidable')());

// 添加模板必需的变量
app.use(function (req, res, next) {
  res.locals.user = req.session.user;
  res.locals.success = req.flash('success').toString();
  res.locals.error = req.flash('error').toString();
  res.locals.money = req.session.money;
  next();
});

// 正常请求的日志
app.use(expressWinston.logger({
  transports: [
    new (winston.transports.Console)({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/success.log'
    })
  ]
}));


//路由
app.use('/', indexRouter);
app.use('/rule', ruleRouter);
app.use('/reg', regRouter);
app.use('/login', loginRouter);
app.use('/result', resultRouter);
app.use('/signout', signoutRouter);

// 错误请求的日志
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/error.log'
    })
  ]
}));

// 404 page
app.use(function (req, res) {
  if (!res.headersSent) {
    res.render('home',{title:"login"});
  }
});


// error page
app.use(function (err, req, res, next) {
  res.render('error', {
    error: err
  });
});

//端口号
app.listen(config.port, function () {
    console.log(`${pkg.name} listening on port ${config.port}`);
});