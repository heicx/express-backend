var userModel = require("../model/user");

//router.get("/list", login.isLogin, model.getJSON());

exports.fetchUserList = function(req, res, next) {
	userModel.get().then(function(users) {
		res.render("user/userList", {users: users, userinfo: req.session.userinfo});
	});
}