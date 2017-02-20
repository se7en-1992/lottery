module.exports = {
  checkLogin: function checkLogin(req, res, next) {
    if (!req.session.user) {
      
      return res.redirect('/login');
    }
    next();
  },

  checkNotLogin: function checkNotLogin(req, res, next) {
    if (req.session.user) {
      
      return res.redirect('/');//返回首页
    }
    next();
  }
};
