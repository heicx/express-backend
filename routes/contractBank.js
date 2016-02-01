var express = require("express");
var router = express.Router();
var login = require("./login");

var fetchContractBankList = function (req, res, next) {
	var contractBankModel = req.models.contract_bank;
	var async = req.query.async || false;
	var params = req.query;

    contractBankModel.getContractBankList(params, function(err, data) {
		if(async) {
			res.json({contractBankList: data});
		}else{
			res.render("dictionary/contractBank", {contractBankList: data, userinfo: JSON.parse(req.session.user)});
		}
	});
}

router.get("/list", login.islogin, fetchContractBankList);

module.exports = router;