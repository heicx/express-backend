module.exports = function(orm, db) {
	var region = db.define("contract_region", {
		id: {type: "serial", key: true},
		region_name: String,
        region_status: {type: "integer", defaultValue: 1}
	});

    region.getRegionListById = function() {

    }

    region.getRegionList = function(params, callback) {
        var pro
        var strWhere = params.region_id ? " where a.id = " + params.region_id : "";
		var sql = "SELECT a.id, a.region_name, c.area_name FROM contract_region a "
				+ "LEFT JOIN contract_region_area b ON a.id = b.region_id "
				+ "LEFT JOIN area c ON c.id = b.area_id" + strWhere;

		db.driver.execQuery(sql, function(err, resultData) {
            if(resultData.length > 0) {
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

                callback(err, {status: true, data: oTemp});
            }else {
                callback(err, {status: false, message: "没有记录"});
            }


		});
	}

    region.addRegion = function(params, callback) {
        if(params.region_name !== "") {
            region.find(params, function(err, existData) {
                if(existData.length > 0) {
                    callback(err, {status: false, message: "大区名称已存在"});
                }else {
                    region.create(params, function(err, items) {
                        if(items)
                            callback(err, {status: true, data: items});
                    });
                }
            });

        }else {
            callback(err, {stauts: false, message: "大区名称不能为空"});
        }
    }
}