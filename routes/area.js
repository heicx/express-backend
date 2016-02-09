var express = require("express");
var router = express.Router();
var login = require("./login");
var areaModel;

var fetchProvinceById = function (req, res, next) {
    var params = req.query;

    areaModel = areaModel || req.models.area;
    areaModel.getProvinceByRegionId(params, function(err, data) {
        res.json({province: data});
    });
}

var fetchCityById = function (req, res, next) {
    var params = req.query;
    areaModel = areaModel || req.models.area;

    areaModel.getCityByProvinceId(params, function(err, data) {
        res.json({city: data});
    });
}

router.use(login.islogin);

router.get("/province", fetchProvinceById);
router.get("/city", fetchCityById);


module.exports = router;