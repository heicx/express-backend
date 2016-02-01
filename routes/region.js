var express = require("express");
var router = express.Router();
var login = require("./login");
var when = require("when");

var getArea = function(req, cb) {
    var areaModel = req.models.area;

    areaModel.getAllArea(null, function(err, areaData) {
        cb(areaData);
    });
}

var getExistArea = function(req) {
    var deferred = when.defer();
    var regionAreaModel = req.models.contract_region_area;
    var params = req.query;

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
    var contractRegionModel = req.models.contract_region;

    contractRegionModel.getRegionList(params, function(err, regionData) {
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

router.get("/list", login.islogin, fetchRegionList);

module.exports = router;