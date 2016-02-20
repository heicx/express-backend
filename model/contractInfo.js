var utils = require("../helper/utils");
var when = require("when");

module.exports = function(orm, db) {
	var Contract = db.define("contract_info", {
		id: {type: "serial", key: true},
		contract_number: String,
		first_party_id: Number,
		second_party_id: Number,
		contract_type: {type: "integer", defaultValue: 0},
		effective_time: Date,
		end_time: Date,
		create_time: {type: "date", defaultValue: new Date()},
		paid_price: {type: "integer", defaultValue: 0},
		deposit: {type: "integer", defaultValue: 0},
		contract_price: Number,
		deposit_remaining: {type: "integer", defaultValue: 0},
		saler_name: String,
		contract_status: {type: "integer", defaultValue: 0}
	});

    Contract.findContractIsExist = function(params) {
        var def = when.defer();

        Contract.find({contract_number: params.contract_number}, function(err, item) {
            if(!err) {
                if(item.length > 0)
                    def.reject("合同已存在");
                else
                    def.resolve(item);
            }else {
                def.reject("合同查重失败");
            }
        });

        return def.promise;
    }

	Contract.getContractInfo = function (params) {
        var def = when.defer();
		var pageNo = params.pageNo || 1;
		var prePageNum = 2;
		var container = {
			pageIndex: pageNo
		}
        var arrOutput = {
            contract_number: {
                keyword: "like",
                sign: ["%", "%"],
                prefix: "a"
            },
            first_party_name: {
                keyword: "like",
                sign: ["%", "%"],
                prefix: "b"
            },
            second_party_name: {
                keyword: "like",
                sign: ["%", "%"],
                prefix: "c"
            },
            effective_time: {
                keyword: ">",
                prefix: "a"
            },
            end_time: {
                keyword: "<",
                prefix: "a"
            },
            saler_name: {
                keyword: "like",
                sign: ["%", "%"],
                prefix: "a"
            },
            contract_status: "a",
            contract_type: "a",
            region_id: "b",
            province_id: "b",
            city_id: "b"
        }

        var strCondition = "", arrArgs = [];
        var arrLimit = [(pageNo - 1) * prePageNum, prePageNum];
        var sql;

        // 默认合同状态为0等待生效
        if(!params.contract_status) {
            params.contract_status = 0;
        }

        // 过滤查询字段,产出关联条件语句及实参数据
        utils.ormFilter(params, arrOutput, function(str, arr) {
            strCondition = str ? " where " + str : "";
            arrArgs = arr;
        });

        sql = "SELECT count(*) as contractCount FROM contract_info a LEFT JOIN contract_first_party b ON a.first_party_id = b.id "
            + "LEFT JOIN contract_second_party c ON a.second_party_id = c.id LEFT JOIN contract_type d ON "
            + "a.contract_type = d.id LEFT JOIN contract_invoice e ON a.contract_number = e.id LEFT JOIN contract_region f ON "
            + "b.region_id = f.id LEFT JOIN area h ON b.province_id = h.id LEFT JOIN area i ON b.city_id = i.id " + strCondition;

        // 根据当前参数查询合同数量
        db.driver.execQuery(sql, arrArgs, function(err, result) {
            if(!err) {
                container.count = result[0].contractCount;

                sql = "SELECT a.contract_number, b.first_party_name, c.second_party_name, d.contract_type_name,TIMESTAMPDIFF(DAY,DATE_FORMAT(a.end_time, '%Y-%m-%d'),NOW()) AS overdue_days,"
                    + "DATE_FORMAT(a.effective_time, '%Y-%m-%d') AS effective_time, DATE_FORMAT(a.end_time, '%Y-%m-%d') AS end_time,"
                    + "a.contract_price, a.deposit, a.paid_price, a.saler_name, a.contract_status,"
                    + "DATE_FORMAT(a.create_time, '%Y-%m-%d') AS create_time, f.region_name, h.area_name AS province_name, i.area_name AS city_name,"
                    + "COUNT(e.id) AS invoice_count, SUM(e.price) AS invoice_price FROM contract_info a "
                    + "LEFT JOIN contract_first_party b ON a.first_party_id = b.id "
                    + "LEFT JOIN contract_second_party c ON a.second_party_id = c.id "
                    + "LEFT JOIN contract_type d ON a.contract_type = d.id "
                    + "LEFT JOIN contract_invoice e ON a.contract_number = e.id "
                    + "LEFT JOIN contract_region f ON b.region_id = f.id "
                    + "LEFT JOIN area h ON b.province_id = h.id "
                    + "LEFT JOIN area i ON b.city_id = i.id "
                    + strCondition + " GROUP BY a.contract_number LIMIT ?,?";

                // 查询合同详细信息
                db.driver.execQuery(sql, arrArgs.concat(arrLimit), function(err, resultData) {
                    if(!err) {
                        container.list = resultData;
                        container.totalPageNum = Math.ceil(container.count / prePageNum);
                        container.pagination = utils.paginationMath(pageNo, container.totalPageNum);

                        def.resolve(container);
                    }else
                        def.reject(err);
                });
            }else
                def.reject(err);
        });

        return def.promise;
	}

    /**
     * 查询逾期合同数量
     * @param params
     */
    Contract.getOverdueDaysCount = function (params) {
        var sql, def = when.defer();

        sql = "select count(*) as overdue_count from contract_info where TIMESTAMPDIFF(DAY, DATE_FORMAT(end_time, '%Y-%m-%d'),NOW()) > 0";

        db.driver.execQuery(sql, function(err, resultData) {
            if(!err)
                def.resolve(resultData[0].overdue_count);
            else
                def.reject("查询逾期合同数量失败");
        });

        return def.promise;
    }

    /**
     * 添加合同
     * @param params
     */
    Contract.addContract = function(params) {
        var def = when.defer();

        Contract.create(params, function(err, items) {
            if(items)
                def.resolve(items);
            else
                def.reject("合同添加失败");
        });

        return def.promise;
    }
}