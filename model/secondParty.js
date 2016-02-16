var utils = require("../helper/utils");

module.exports = function(orm, db) {
	var secondParty = db.define("contract_second_party", {
		id: {type: "serial", key: true},
		second_party_name: String
	});

    /**
     * 获取乙方数据
     * @param params(second_party_name: 乙方名称)
     * @param callback
     */
	secondParty.getSecondPartyList = function(params, callback) {
        var sql, strCondition;
        var arrOutput = {
            second_party_name: {
                keyword: "like",
                sign: ["%", "%"]
            }
        }

        utils.ormFilter(params, arrOutput, function(str, arr) {
            strCondition = str ? " where " + str : "";

            sql = "select id, second_party_name from contract_second_party";
                + strCondition;

            db.driver.execQuery(sql, arr, function(err, resultData) {
                callback(err, resultData);
            });
        });
	}

    /**
     * 添加乙方
     * @param params(second_party_name: 乙方名称)
     * @param callback
     */
    secondParty.addSecondParty = function(params, callback) {
        // 乙方名称查重
        secondParty.find(params, function(err, item) {
            if(!err) {
                if(item.length > 0) {
                    callback(err, {status: false, message: "乙方名称已存在"});
                }else {
                    // 添加乙方
                    secondParty.create(params, function(err, items) {
                        if(items) {
                            // 获取新增乙方的信息
                            secondParty.getSecondPartyList({second_party_name: items.second_party_name}, function(err, newItem) {
                                callback(err, {status: true, data: newItem});
                            });
                        }else {
                            callback(err, {status: false, message: "添加失败"})
                        }
                    });
                }
            }else {
                callback(err, {status: false, message: "乙方名称查重失败"});
            }
        });
    }
}