var express = require("express");
var router = express.Router();
var login = require("./login");

var fetchFirstPartyList = function (req, res) {
	var firstPartyModel = req.models.contract_first_party;
    var regionModel = req.models.contract_region;
	var async = req.query.async || false;
	var params = req.query;

	firstPartyModel.getFirstPartyList(params, function(err, firstParty) {
        if(!err) {
            if(async) {
                res.json({status: true, data: firstParty});
            }else {
                regionModel.getAllRegion({}, function(err, region) {
                    if(!err) {
                        res.render("dictionary/firstPartyList", {firstPartyList: firstParty, regionlist: region, userinfo: JSON.parse(req.session.user)});
                    }
                });
            }
        }
	});
}

var addFirstParty = function(req, res) {
    var firstPartyModel = req.models.contract_first_party;
    var params = {
        first_party_name: req.body.firstPartyName,
        region_id: req.body.regionId,
        province_id: req.body.provinceId,
        city_id: req.body.cityId
    };

    firstPartyModel.addFirstParty(params, function(err, firstParty) {
        res.json(firstParty);
    });
}

router.use(login.islogin);

router.get("/list", fetchFirstPartyList);
router.post("/add", addFirstParty);


module.exports = router;