module.exports = function(orm, db) {
	var regionArea = db.define("contract_region_area", {
		id: Number,
		region_id: Number,
		area_id: Number,
        status: {type: "integer", defaultValue: 1}
	});

    regionArea.getExistAreaId = function(params, callback) {
        var _initParams = {status: 1};

        if(params.region_id)
            _initParams.region_id = params.region_id;

        regionArea.find(_initParams, function(err, resultData) {
            callback(err, resultData);
        });
    }

    regionArea.addRegionArea = function(arrParams, callback) {
        if(arrParams instanceof Array && arrParams.length > 0) {
            regionArea.create(arrParams, function(err, items) {
                if(items.length > 0) {
                    callback(err, {status: true, data: items});
                }else {
                    callback(err, {status: false, message: "数据插入失败"});
                }
            });
        }
    }
}