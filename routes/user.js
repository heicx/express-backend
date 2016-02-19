var express = require("express");
var router = express.Router();
var login = require("./login");
var when = require("when");
var userModel;

var fetchUserList = function(req, res) {
    var userType = JSON.parse(req.session.user).user_type;

    userModel = userModel || req.models.contract_user;

    if(userType == 1) {
        userModel.getAllUser(userType).then(function(users) {
            console.log(req.session.userinfo);
            res.render("user/userList", {users: users, userinfo: JSON.parse(req.session.user)});
        }).catch(function(errMsg) {
            res.status(500).send(errMsg);
        });
    }else {
        res.status(500).send("您没有权限");
    }
}

var addUser = function(req, res) {

}

router.use(login.islogin);

router.get("/list", fetchUserList);
router.post("/add", addUser);

module.exports = router;