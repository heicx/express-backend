var when = require("when");

module.exports = function(orm, db) {
	var region = db.define("contract_region", {
		id: {type: "serial", key: true},
		region_name: String,
        region_status: {type: "integer", defaultValue: 1}
	});

    /**
     * 获取所有大区
     * @param params
     * @param callback
     */
    region.getAllRegion = function() {
        var def = when.defer();

        region.find(function(err, region) {
            if(!err) {
                def.resolve(region);
            }else {
                def.reject("获取所有大区失败");
            }
        });

        return def.promise;
    }

    /**
     * 获取大区及包含的地区
     * @param params{region_id: 大区id}
     * @param callback
     */
    region.getRegionList = function(params, callback) {
        var strWhere = params.region_id ? " where a.id = " + params.region_id : "";
		var sql = "SELECT a.id, a.region_name, c.area_name FROM contract_region a "
				+ "LEFT JOIN contract_region_area b ON a.id = b.region_id "
				+ "LEFT JOIN area c ON c.id = b.area_id" + strWhere;

		db.driver.execQuery(sql, function(err, resultData) {
            if(resultData.length > 0) {
                var key, oTemp = {};

                for(var i = 0; i < resultData.length; i++) {
                    key = resultData[i].region_name;

                    if(oTemp[key]) {
                        oTemp[key].region_id =  resultData[i].id;
                        oTemp[key].area_name.push(resultData[i].area_name);
                    }else {
                        oTemp[key] = {
                            region_id: resultData[i].id,
                            area_name: [resultData[i].area_name]
                        }
                    }
                }

                callback(err, {status: true, data: oTemp});
            }else {
                callback(err, {status: false, message: "没有记录"});
            }


		});
	}

    /**
     * 添加大区
     * @param params{region_name: 大区名称}
     * @param callback
     */
    region.addRegion = function(params, callback) {
        if(params.region_name !== "") {
            // 查询大区是否已存在
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


    /**
     * 更新大区
     * @param params{regionId: 大区ID, regionName: 大区名称, areaIds: 大区所包含的地区id}
     * @param callback
     */
    region.updateRegion = function(params, callback) {
        // 排除当前大区id,同时查询并校验大区名称是否已经存在
        region.find({region_name: params.regionName, id: orm.ne(params.regionId)}, function(err, existData) {
            if(existData.length > 0) {
                callback(err, {status: false, message: "大区名称已存在"});
            }else {
                // 查找要编辑更新的大区
                region.find({id: params.region_id}, function(err, existData) {
                    var promiseData = {
                        status: false,
                        message: "大区名称修改失败"
                    }

                    if(existData.length > 0) {
                        // 对大区名称进行更新修改
                        existData[0].save({region_name: params.region_name}, function(err) {
                            if(!err) {
                                promiseData.status = true;
                                promiseData.message = "大区名称更新成功";
                            }

                            callback(err, promiseData);
                        });
                    }else {
                        callback(err, promiseData);
                    }
                });
            }
        });
    }
}