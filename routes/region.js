var express = require("express");
var router = express.Router();
var login = require("./login");
var when = require("when");
var regionModel, regionAreaModel, areaModel;

/**
 * 获取所有地区
 * @param req
 * @param cb
 */
var fetchAllArea = function(req, cb) {
    areaModel = areaModel || req.models.area;

    areaModel.getAllArea(null, function(err, areaData) {
        cb(areaData);
    });
}

/**
 * 根据地区id获取已存在的地区
 * @param req
 * @returns {Promise}
 */
var fetchExistArea = function(req) {
    var deferred = when.defer();
    var params = req.query;

    regionAreaModel = regionAreaModel || req.models.contract_region_area;
    regionAreaModel.getExistAreaId(params, function(err, existAreaData) {
        var arrExist = [];

        for(var i=0; i < existAreaData.length; i++) {
            arrExist.push(existAreaData[i].area_id);
        }

        deferred.resolve(arrExist);
    });

    return deferred.promise;
}

/**
 * 获取大区及地区相关数据
 * @param req
 * @param res
 */
var fetchRegionAreaList = function (req, res) {
    var async = req.query.async || false;
    var params = req.query;

    regionModel = regionModel || req.models.contract_region;
    regionModel.getRegionList(params, function(err, region) {
        var promiseData = {};

        promiseData.region = region.data || [];

        fetchAllArea(req, function(areaData) {
            promiseData.allArea = areaData;

            fetchExistArea(req).then(function(existData) {
                promiseData.existArea = existData;

                if(async) {
                    res.json({status: true, data: promiseData});
                }else {
                    res.render("dictionary/region", {regionList: promiseData, userinfo: JSON.parse(req.session.user)});
                }
            });
        });
	});
}

/**
 * 编辑大区
 * @param req
 * @param res
 */
var editRegion = function(req, res) {
    var params = {
        region_id: req.body.regionId,
        region_name: req.body.regionName,
        area_ids: req.body.areaIds
    }

    regionAreaModel = regionAreaModel || req.models.contract_region_area;
    regionModel = regionModel || req.models.contract_region;
    regionModel.updateRegion(params, function(err, region) {
        if(region.status) {
            regionAreaModel.updateAreaByRegionId(params, function(err, regionArea) {
                if(regionArea.status) {
                    regionModel.getRegionList(params, function(err, region) {
                        res.json(region);
                    });
                }else {
                    res.json(regionArea);
                }
            });
        }
    });

}

/**
 * 添加大区
 * @param req
 * @param res
 */
var addRegion = function(req, res) {
    var params = {
        region_name: req.body.regionName
    };

    regionModel = regionModel || req.models.contract_region;
    regionAreaModel = regionAreaModel || req.models.contract_region_area;

    // 添加大区
    regionModel.addRegion(params, function(err, region) {
        if(region.status && region.data.id) {
            var i = 0, params = [];

            for(; i < req.body.areaIds.length; i++) {
                params.push({
                    "region_id": region.data.id,
                    "area_id": req.body.areaIds[i]
                });
            }

            // 添加大区下的所选地区
            regionAreaModel.addRegionArea(params, function(err, regionArea) {
                if(err) console.log(err);

                if(regionArea.data.length > 0) {
                        var _params = {
                        region_id: regionArea.data[0].region_id
                    }

                    // 获取已添加的大区及地区
                    regionModel.getRegionList(_params, function(err, region) {
                        res.json(region);
                    });
                }else {
                    res.json({status: false, message: "添加大区下的所选失败"});
                }
            });
        }else {
            res.json(region).end();
        }
    })
}

router.use(login.islogin);
router.get("/list", fetchRegionAreaList);
router.post("/add", addRegion);
router.post("/edit", editRegion);

module.exports = router;