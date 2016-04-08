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

/**
 * 跳转修改密码页
 * @param req
 * @param res
 */
var modifyView = function(req, res){ 
    res.render("user/modifyPassword",{userinfo: JSON.parse(req.session.user)});
}


/**
 * 生成器
 *
 * 修改密码
 * @param params
 *
 * 1. 验证输入旧密码
 * 2. 修改密码
 */
var genModifyPass = function* (req, params) {
    userModel = userModel || req.models.contract_user;

    yield userModel.getUserValid(params);    
    yield userModel.modifyUserPass(params);
    
}


/**
 * 修改密码
 * @param req
 * @param res
 */
var modifyUserPass = function(req, res){ 
    var params = {
        user_name: req.body.user_name,
        user_password: req.body.user_password,
        user_password_old: req.body.user_password_old
    };

    console.info(params);
    
    var genModify=genModifyPass(req, params);
    
    var validPass=genModify.next().value;
    validPass.then(function(result){                        
        genModify.next().value.then(function(result){ 
            res.json({status: true, message:result});
        }).catch(function(errMsg) {
            res.json({status: false, message: errMsg});
        });
    }).catch(function(errMsg) {
        res.json({status:false, message:errMsg});
    });
}



router.use(login.islogin);

router.get("/list", fetchUserList);
router.post("/add", addUser);
router.get("/modify", modifyView);
router.post("/modify", modifyUserPass);

module.exports = router;