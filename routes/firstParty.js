var express = require("express");
var router = express.Router();
var login = require("./login");
var when = require("when");
var firstPartyModel, regionModel;

// 获取甲方模块预加载数据
var fetchFirstPartyInfo = function* (req) {
    var params = req.query;

    firstPartyModel = firstPartyModel || req.models.contract_first_party;
    regionModel = regionModel || req.models.contract_region;

    yield firstPartyModel.getFirstPartyList(params);
    yield regionModel.getAllRegion({});
}

/**
 * 添加甲方
 * @param req
 * @param res
 */
var addFirstParty = function(req, res) {
    var params = {
        first_party_name: req.body.firstPartyName,
        region_id: req.body.regionId,
        province_id: req.body.provinceId,
        city_id: req.body.cityId
    };
    firstPartyModel = firstPartyModel || req.models.contract_first_party;

    firstPartyModel.findFirstPartyNameIsExists({first_party_name: req.body.firstPartyName}).then(function() {
        firstPartyModel.createFirstParty(params).then(function() {
            firstPartyModel.getFirstPartyList({fuzzy: false, first_party_name: params.first_party_name}).then(function(item) {
                res.json({status: true, data: item});
            }).catch(function(errMsg) {
                res.json({status: false, message: errMsg});
            })
        }).catch(function(errMsg) {
            res.json({status: false, message: errMsg});
        });
    }).catch(function(errMsg) {
        res.json({status: false, message: errMsg});
    });
}

// 拼装预加载数据
var packFirstPartyBasicData = function(req, res) {
    var async = req.query.async || false;
    var arrPromise = [], item = null;
    var gen = fetchFirstPartyInfo(req);

    for(item of gen) {
        arrPromise.push(item);
    }

    when.all(arrPromise).then(function(result) {
        var firstParty = result[0];
        var region = result[1];

        if(async)
            res.json({status: true, data: firstParty});
        else
            res.render("dictionary/firstPartyList", {firstPartyList: firstParty, regionlist: region, userinfo: JSON.parse(req.session.user)});
    }).catch(function(errMsg) {
        if(async)
            res.json({status: false, message: errMsg});
        else
            res.status(500).send(errMsg);
    });
}

router.use(login.islogin);

router.get("/list", packFirstPartyBasicData);
router.post("/add", addFirstParty);


module.exports = router;