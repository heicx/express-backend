var express = require("express");
var router = express.Router();
var login = require("./login");

var fetchContractList = function (req, res, next) {
	var contractModel = req.models.contract_info;
	var async = req.query.async || false;
	var params = req.query;

	contractModel.getContractInfo(params, function(err, data) {
		if(async) {
			res.json({contractList: data});
		}else {
            res.render("contract/contractList", {contractList: data, userinfo: JSON.parse(req.session.user)});
        }
	});
}

router.get("/list", login.islogin, fetchContractList);

module.exports = router;