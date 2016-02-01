var express = require("express");
var router = express.Router();
var login = require("./login");

var fetchFirstPartyList = function (req, res, next) {
	var firstPartyModel = req.models.contract_first_party;
	var async = req.query.async || false;
	var params = req.query;

	firstPartyModel.getFirstPartyList(params, function(err, data) {
		if(async) {
			res.json({firstPartyList: data});
		}else
			res.render("dictionary/firstPartyList", {firstPartyList: data, userinfo: JSON.parse(req.session.user)});
	});
}

router.get("/list", login.islogin, fetchFirstPartyList);

module.exports = router;