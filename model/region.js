module.exports = function(orm, db) {
	var region = db.define("contract_region", {
		id: {type: "serial", key: true},
		region_name: String,
		region_status: Number
	});

    region.getRegionList = function(params, callback) {
		var sql = "SELECT a.id, a.region_name, c.area_name FROM contract_region a "
				+ "LEFT JOIN contract_region_area b ON a.id = b.region_id "
				+ "LEFT JOIN area c ON c.id = b.area_id";

		db.driver.execQuery(sql, function(err, resultData) {
            if(resultData) {
                var oTemp = {};

                for(var i = 0; i < resultData.length; i++) {
                    if(oTemp[resultData[i].region_name]) {
                        var area_name = oTemp[resultData[i]["region_name"]].area_name || "";

                        oTemp[resultData[i].region_name] = {
                            region_id: resultData[i].id
                        }
                        oTemp[resultData[i]["region_name"]].area_name = area_name + " " + resultData[i].area_name;
                    }else {
                        oTemp[resultData[i]["region_name"]] = {
                            area_name: resultData[i].area_name,
                            region_id: resultData[i].id
                        }
                    }
                }

                callback(null, oTemp);
            }
		});
	}
}