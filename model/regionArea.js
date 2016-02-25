module.exports = function(orm, db) {
	var regionArea = db.define("contract_region_area", {
		id: Number,
		region_id: Number,
		area_id: Number,
        create_time: {type: "date", defaultValue: new Date()},
        update_time: {type: "date", defaultValue: new Date()},
        status: {type: "integer", defaultValue: 1}
	});

    /**
     * 根据大区id查询当前大区下包含的所有地区
     * @param params{region_id: 大区id}
     * @param callback
     */
    regionArea.getExistAreaId = function(params, callback) {
        var _initParams = {status: 1};

        if(params.region_id)
            _initParams.region_id = params.region_id;

        regionArea.find(_initParams, function(err, resultData) {
            callback(err, resultData);
        });
    }

    /**
     * 添加大区所包含的地区
     * @param arrParams[{region_id: 大区id, area_id: 地区id}]
     * @param callback
     */
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

    /**
     * 根据大区id更新大区下的地区
     * @param params{region_id: 大区id, region_name: 大区名称, area_ids: 新地区id}
     * @param callback
     */
    regionArea.updateAreaByRegionId = function(params, callback) {
        // 查找并删除当前大区已有地区
        regionArea.find({region_id: params.region_id}).remove(function(err) {
            if(!err) {
                var arrParams = [], i = 0;
                var arrAreaIds = params.area_ids;

                for(; i < arrAreaIds.length; i++) {
                    arrParams.push({
                        region_id: params.region_id,
                        area_id: arrAreaIds[i],
                        update_time: new Date()
                    });
                }

                if(arrParams.length > 0) {
                    // 新增当前大区的关联地区
                    regionArea.create(arrParams, function(err, items) {
                        if(items.length > 0) {
                            callback(err, {status: true, data: items});
                        }else {
                            callback(err, {status: false, message: "数据插入失败"});
                        }
                    });
                }else {
                    callback(null, {status: false, message: "貌似没有新增地区"});
                }
            }else {
                callback(err, {status: false, message: "没有此大区信息"});
            }
        });
    }
}