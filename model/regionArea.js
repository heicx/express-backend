module.exports = function(orm, db) {
	var regionArea = db.define("contract_region_area", {
		id: Number,
		region_id: Number,
		area_id: Number,
        status: Number
	});

    regionArea.getExistAreaId = function(params, callback) {
        var _initParams = {status: 1};

        if(params.region_id)
            _initParams.region_id = params.region_id;

        regionArea.find(_initParams, function(err, resultData) {
            callback(null, resultData);
        });
    }
}