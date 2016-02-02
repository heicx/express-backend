var express = require("express");
var router = express.Router();
var login = require("./login");
var when = require("when");
var regionModel, regionAreaModel;

var getArea = function(req, cb) {
    var areaModel = req.models.area;

    areaModel.getAllArea(null, function(err, areaData) {
        cb(areaData);
    });
}

var getExistArea = function(req) {
    var deferred = when.defer();
    var params = req.query;

    regionAreaModel = regionAreaModel || req.models.contract_region_area;
    regionAreaModel.getExistAreaId(params, function(err, existAreaData) {
        var arrExist = [];

        for(var i=0; i < existAreaData.length; i++) {
            arrExist.push(existAreaData[i].id);
        }

        deferred.resolve(arrExist);
    });

    return deferred.promise;
}

var fetchRegionList = function (req, res) {
    var async = req.query.async || false;
    var params = req.query;

    regionModel = regionModel || req.models.contract_region;
    regionModel.getRegionList(params, function(err, regionData) {
        var promiseData = {region: regionData};

        getArea(req, function(areaData) {
            promiseData.allArea = areaData;

            getExistArea(req).then(function(existData) {
                promiseData.existArea = existData;

                if(async) {
                    res.json(promiseData);
                }else {
                    res.render("dictionary/region", {regionList: promiseData, userinfo: JSON.parse(req.session.user)});
                }
            });
        });
	});
}

var editRegion = function() {

}

var addRegion = function(req, res) {
    var params = {
        regionName: req.body.regionName
    };

    res.status(404).end();
    regionModel = regionModel || req.models.contract_region;
    regionModel.addRegion(params, function(err, message) {
        console.log(message);
        // 成功 再insert另一张表
    })
}

router.use(login.islogin);
router.get("/list", fetchRegionList);
router.post("/add", addRegion);
//router.post("/edit", editRegion);

module.exports = router;