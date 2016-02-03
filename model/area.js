module.exports = function(orm, db) {
	var area = db.define("area", {
		id: Number,
		parentid: Number,
		area_name: String,
        area_ename: String
	});

    area.getAllArea = function(params, callback) {
        area.find({parentid: 0, id: orm.gt(0)}, function(err, areaData) {
            callback(err, areaData);
		});
	}
}