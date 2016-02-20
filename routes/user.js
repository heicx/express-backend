var express = require("express");
var router = express.Router();
var login = require("./login");
var when = require("when");
var userModel;

/**
 * 获取用户
 * @param req
 * @param res
 */
var fetchUserList = function(req, res) {
    var params = req.query;
    var async = params.async || false;
    var userType = JSON.parse(req.session.user).user_type;

    userModel = userModel || req.models.contract_user;

    params.user_type = userType;
    userModel.getUser(params).then(function(users) {
        if(async)
            res.json({status: true, data: users});
        else
            res.render("user/userList", {users: users, userinfo: JSON.parse(req.session.user)});
    }).catch(function(errMsg) {
        res.status(500).send(errMsg);
    });
}

/**
 * 生成器
 *
 * 添加用户
 * @param params
 *
 * 1. 用户查重
 * 2. 添加用户
 */
var genAddUser = function* (params) {
    userModel = userModel || req.models.contract_user;

    yield userModel.findUserIsExist(params);
    yield userModel.addUser(params);
}

/**
 * 添加用户
 * @param req
 * @param res
 */
var addUser = function(req, res) {
    var params = {
        user_name: req.body.user_name,
        user_email: req.body.user_email,
        user_password: req.body.user_password,
        user_type: req.body.user_type
    };
    var genUser = genAddUser(params);

    var userIsExistRes = genUser.next().value;

    userIsExistRes.then(function() {
        genUser.next().value.then(function(result) {
            res.json({status: true, data: result});
        }).catch(function(errMsg) {
            res.json({status: false, message: errMsg});
        });
    }).catch(function(errMsg) {
        res.json({status: false, message: errMsg});
    });
}

router.use(login.islogin);

router.get("/list", fetchUserList);
router.post("/add", addUser);

module.exports = router;