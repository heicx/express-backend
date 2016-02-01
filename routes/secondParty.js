var express = require("express");
var router = express.Router();
var login = require("./login");

var fetchSecondPartyList = function (req, res, next) {
	var secondPartyModel = req.models.contract_second_party;
	var async = req.query.async || false;
	var params = req.query;

	secondPartyModel.getSecondPartyList(params, function(err, data) {
		if(async) {
			res.json({secondPartyList: data});
		}else{
			res.render("dictionary/secondPartyList", {secondPartyList: data, userinfo: JSON.parse(req.session.user)});
		}
	});
}

router.get("/list", login.islogin, fetchSecondPartyList);

module.exports = router;