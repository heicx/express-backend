var utils = require("../helper/utils");
var when = require("when");

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
	firstParty.getFirstPartyList = function(params) {
        var def = when.defer();
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

            sql = "select a.id, a.first_party_name, b.region_name, d.area_name, e.area_name as city_name from contract_first_party a "
                + "left join contract_region b on b.id = a.region_id "
                + "left join area d on d.id = a.province_id "
                + "left join area e on a.city_id = e.id "
                + strCondition;

            db.driver.execQuery(sql, arr, function(err, resultData) {
                if(!err)
                    def.resolve(resultData);
                else
                    def.reject("根据甲方名称获取甲方列表信息失败");
            });
        });

        return def.promise;
	}

    // 甲方名称查重
    firstParty.findFirstPartyNameIsExists = function(params) {
        var def = when.defer();

        firstParty.find({first_party_name: params.first_party_name}, function(err, item) {
            if(!err) {
                if(item.length > 0)
                    def.reject("甲方名称已存在");
                else
                    def.resolve(item);
            }else {
                def.reject("甲方名称查重失败");
            }
        });

        return def.promise;
    }

    // 添加甲方
    firstParty.createFirstParty = function(params) {
        var def = when.defer();

        firstParty.create(params, function(err, items) {
            if(!err) {
                if(items)
                    def.resolve(items);
                else
                    def.reject("添加甲方失败");
            }else {
                def.reject("添加甲方失败");
            }
        });

        return def.promise;
    }

    // 获取新增甲方的信息
    firstParty.getFirstPartyListByName = function(items) {
        var def = when.defer();

        firstParty.getFirstPartyList({first_party_name: items.first_party_name}).then(function(newItem) {
            def.resolve(newItem);
        }).catch(function() {
            def.reject("获取新增甲方的信息失败");
        });

        return def.promise;
    }
}