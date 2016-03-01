var express = require("express");
var router = express.Router();

/**
 * 用户登陆
 * @param req
 * @param res
 * @param next
 */
var isLogin = function(req, res, next) {
    var async = req.query.async || false;

	if(!req.session || !req.session.user) {
        if(async)
            res.json({status: false, message: "未登录"});
        else
            res.redirect("/login");
    }else {
    	next();
    }
}

/**
 * 验证用户是否已经登陆
 * @param req
 * @param res
 */
var userIsLogin = function(req, res) {
    if(!req.session || !req.session.user) {
        res.render("login");
    }else {
        res.redirect("/contract/list");
    }
}

/**
 * 用户登陆
 * @param req
 * @param res
 */
var userLogin = function(req, res) {
    var params = {
        name: req.body.username,
        password: req.body.password
    }
    var userModel = req.models.contract_user;

    userModel.getUserByParams(params).then(function(user) {
        if(user.length > 0) {
            req.session.user = JSON.stringify(user[0]);
            res.redirect("/contract/list");
        }else {
            res.redirect("/login");
        }
    }).catch(function(errMsg) {
        res.status(500).send(errMsg);
    });
}

var userLogout = function(req, res) {
    req.session.destroy();
    res.redirect("/");
}

router.get("/", isLogin, userIsLogin);
router.get("/login", userIsLogin);
router.post("/login", userLogin);
router.get("/logout", userLogout);

exports.routes = router;
exports.islogin = isLogin;