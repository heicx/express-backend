var express = require("express");
var router = express.Router();
var login = require("./login");

var fetchRegionList = function (req, res, next) {
	var contractRegionModel = req.models.contract_region;
	var async = req.query.async || false;
	var params = req.query;

    contractRegionModel.getRegionList(params, function(err, data) {
		if(async) {
			res.json({regionList: data});
		}else {
            console.log(data);
            res.render("dictionary/region", {regionList: data, userinfo: JSON.parse(req.session.user)});
        }
	});
}

router.get("/list", login.islogin, fetchRegionList);

module.exports = router;