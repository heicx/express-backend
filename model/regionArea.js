module.exports = function(orm, db) {
	var regionArea = db.define("contract_region_area", {
		id: Number,
		region_id: Number,
		area_id: Number,
        status: Number
	});

    regionArea.getExistAreaId = function(params, callback) {
        regionArea.find({status: 1}, function(err, resultData) {
            callback(null, resultData);
        });
    }
}