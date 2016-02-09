var utils = require("../helper/utils");

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

    /**
     * 根据大区id获取省份数据
     * @param params (region_id: 大区id)
     * @param callback
     */
    area.getProvinceByRegionId = function(params, callback) {
        var strCondition = "", arrArgs = [], sql;
        var arrOutput = {
            region_id: "a"
        };

        // 过滤查询字段,产出关联条件语句及实参数据.
        utils.ormFilter(params, arrOutput, function(str, arr) {
            strCondition = str ? " where " + str + " and a.status = 1" : "";
            arrArgs = arr;
        });

        if(strCondition) {
            sql = "select a.area_id, b.area_name as province_name from contract_region_area a "
                + "left join area b on a.area_id = b.id " + strCondition;

            db.driver.execQuery(sql, arrArgs, function(err, resultData) {
                callback(err, resultData);
            });
        }else {
            callback(null, []);
        }

    }

    /**
     * 根据省id获取地市数据
     * @param params (area_id: 省份id)
     * @param callback
     */
    area.getCityByProvinceId = function(params, callback) {
        var strCondition = "", arrArgs = [], sql;
        var arrOutput = {
            area_id: "a"
        };

        // 过滤查询字段,产出关联条件语句及实参数据.
        utils.ormFilter(params, arrOutput, function(str, arr) {
            strCondition = str ? " where " + str + " and a.status = 1" : "";
            arrArgs = arr;
        });

        if(strCondition) {
            sql = "select b.id, b.area_name as city_name from contract_region_area a "
                + "left join area b on a.area_id = b.parentid" + strCondition;

            db.driver.execQuery(sql, arrArgs, function(err, resultData) {
                callback(err, resultData);
            });
        }else {
            callback(null, []);
        }

    }
}