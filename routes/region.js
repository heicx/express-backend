var express = require("express");
var router = express.Router();
var login = require("./login");
var when = require("when");
var models = null;

var getArea = function(regionData) {
    var deferred = when.defer();
    var areaModel = models.area;

    areaModel.getAllArea(null, function(err, areaData) {
        regionData.allArea = areaData;
        deferred.resolve(regionData);
    });

    return deferred.promise;
}

var getExistArea = function(regionData) {
    var deferred = when.defer();
    var regionAreaModel = models.contract_region_area;

    regionAreaModel.getExistAreaId(null, function(err, existAreaData) {
        regionData.existAreaData = existAreaData;
        deferred.resolve(regionData);
    });

    return deferred.promise;
}

var fetchRegionList = function (req, res) {
    var contractRegionModel;

    models = req.models;
    contractRegionModel = models.contract_region;

    contractRegionModel.getRegionList(null, function(err, regionData) {
        var regionData = {region: regionData};

        getArea(regionData).then(getExistArea).then(function(regionData) {
            res.render("dictionary/region", {regionList: regionData, userinfo: JSON.parse(req.session.user)});
        })
	});
}

router.get("/list", login.islogin, fetchRegionList);

module.exports = router;