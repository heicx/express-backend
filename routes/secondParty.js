var express = require("express");
var router = express.Router();
var login = require("./login");

var fetchSecondPartyList = function (req, res) {
	var secondPartyModel = req.models.contract_second_party;
	var async = req.query.async || false;
	var params = req.query;

	secondPartyModel.getSecondPartyList(params, function(err, secondParty) {
		if(async) {
			res.json({status: true, data: secondParty});
		}else{
			res.render("dictionary/secondPartyList", {secondPartyList: secondParty, userinfo: JSON.parse(req.session.user)});
		}
	});
}

var addSecondParty = function(req, res) {
    var secondPartyModel = req.models.contract_second_party;
    var params = {
        second_party_name: req.body.secondPartyName
    };

    secondPartyModel.addSecondParty(params, function(err, secondParty) {
        res.json(secondParty);
    });
}

router.use(login.islogin);

router.get("/list", fetchSecondPartyList);
router.post("/add", addSecondParty);

module.exports = router;