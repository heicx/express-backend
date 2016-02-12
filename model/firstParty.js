var utils = require("../helper/utils");

module.exports = function(orm, db) {
	var firstParty = db.define("contract_first_party", {
		id: {type: "serial", key: true},
		first_party_name: String,
		region_id: Number,
		province_id: Number,
		city_id: Number,
		district_id: Number
	});

    /**
     * 根据甲方名称获取甲方列表信息
     * @param params
     * @param callback
     */
	firstParty.getFirstPartyList = function(params, callback) {
        var sql, strCondition;
        var arrOutput = {
            first_party_name: {
                keyword: "like",
                sign: ["%", "%"],
                prefix: "a"
            }
        }

        utils.ormFilter(params, arrOutput, function(str, arr) {
            strCondition = str ? " where " + str : "";

            sql = "select a.first_party_name, b.region_name, d.area_name, e.area_name as city_name from contract_first_party a "
                + "left join contract_region b on b.id = a.region_id "
                + "left join area d on d.id = a.province_id "
                + "left join area e on a.city_id = e.id "
                + strCondition;

            db.driver.execQuery(sql, arr, function(err, resultData) {
                callback(err, resultData);
            });
        });
	}

    /**
     * 添加甲方
     * @param params
     * @param callback
     */
    firstParty.addFirstParty = function(params, callback) {
        var _params = {
            first_party_name: params.first_party_name,
            region_id: params.region_id,
            province_id: params.province_id,
            city_id: params.city_id
        }

        // 甲方名称查重
        firstParty.find({first_party_name: _params.first_party_name}, function(err, item) {
            if(!err) {
                if(item.length > 0) {
                    callback(err, {status: false, message: "甲方名称已存在"});
                }else {
                    // 添加甲方
                    firstParty.create(_params, function(err, items) {
                        if(items) {
                            // 获取新增甲方的信息
                            firstParty.getFirstPartyList({first_party_name: items.first_party_name}, function(err, newItem) {
                                callback(err, {status: true, data: newItem});
                            });
                        }else {
                            callback(err, {status: false, message: "添加失败"})
                        }
                    });
                }
            }else {
                callback(err, {status: false, message: "甲方名称查重失败"});
            }
        });

    }
}