var express = require("express");
var router = express.Router();
var login = require("./login");

var fetchContractTypeList = function (req, res, next) {
	var contractTypeModel = req.models.contract_type;
	var async = req.query.async || false;
	var params = req.query;

	contractTypeModel.getContractTypeList(params, function(err, data) {
		if(async) {
			res.json({contractTypeList: data});
		}else {
            res.render("dictionary/contractType", {contractTypeList: data, userinfo: JSON.parse(req.session.user)});
        }
	});
}

router.get("/list", login.islogin, fetchContractTypeList);

module.exports = router;