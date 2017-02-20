var path = require('path');
var sha1 = require('sha1');
var express = require('express');
var router = express.Router();


var UserModel = require('../models/users');
var checkNotLogin = require('../judgeLogin/check').checkNotLogin;


router.get('/*',checkNotLogin, function(req, res) {
  res.render('reg', {
    title:"reg"
  });
});


// POST /signup 用户注册
router.post('/', checkNotLogin, function(req, res, next) {

  var name = req.fields.name;

  var password = req.fields.password;

  var repassword = req.fields.repassword;

  var money = String((Math.floor((Math.random()) *9 )+1)*11111);


  // 校验参数
  try {

    if (!(name.length >= 1 && name.length <= 10)) {

      throw new Error('名字请限制在 1-10 个字符');

    }
    
    if (password.length < 6) {

      throw new Error('密码至少 6 个字符');

    }
    if (password !== repassword) {

      throw new Error('两次输入密码不一致');

    }
  } catch (e) {

  	req.flash('error', e.message);

    return res.redirect('/reg');

  }

  // 明文密码加密
  password = sha1(password);

  // 待写入数据库的用户信息
  var user = {

    name: name, 

    password: password,

    money:money
  };
  // 用户信息写入数据库
  UserModel.create(user)

    .then(function (result) {

      // 此 user 是插入 mongodb 后的值，包含 _id
      user = result.ops[0];
      
     
      // 写入 flash
      req.flash('success', "注册成功");
      // 跳转到首页
      res.redirect('/login');
    })
    .catch(function (e) {
      // 用户名被占用则跳回注册页，而不是错误页
      if (e.message.match('E11000 duplicate key')) { 

      	req.flash('error', "用户名已被使用！");       

        return res.redirect('/reg');

      }
      next(e);
    });
});


module.exports = router;