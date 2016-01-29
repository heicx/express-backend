var express = require("express");
var router = express.Router();

var isLogin = function(req, res, next) {
	if(!req.session || !req.session.user) {
		res.redirect("/login");
    }else {
    	next();
    }
}

router.get("/", isLogin, function(req, res, next) {
    res.redirect("/contract/list");
});
router.get("/login", function(req, res, next) {
    if(!req.session || !req.session.user) {
        res.render("login");
    }else {
        res.redirect("/contract/list");
    }
});
router.post("/login", function(req, res, next) {
    var params = {
        name: req.body.username,
        password: req.body.password
    }
    var userModel = req.models.contract_user;

    // 验证登陆用户
    userModel.getUser(params, function(err, user) {
        if(user.length > 0) {
            req.session.user = JSON.stringify(user[0]);
            res.redirect("/contract/list");
        }else {
            res.redirect("/login");
        }
    });
});

exports.routes = router;
exports.islogin = isLogin;