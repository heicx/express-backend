var utils = require("../helper/utils");

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

	Contract.getContractInfo = function (params, callback) {
		var pageNo = params.pageNo || 1;
		var prePageNum = 20;
		var container = {
			pageIndex: pageNo
		}
        var arrOutput = {
            contract_number: "a",
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


		Contract.count(function(err, listCount) {
			container.count = listCount;

			if(listCount == 0) {
				container.totalPageNum = 0;

				callback(null, container);
			}else {
                var strCondition = "", arrArgs = [];
                var arrLimit = [(pageNo - 1) * prePageNum, prePageNum];
                var sql;

                // 过滤查询字段,产出关联条件语句及实参数据.
                utils.ormFilter(params, arrOutput, function(str, arr) {
                    strCondition = str ? " where " + str : "";
                    arrArgs = arr.concat(arrLimit);
                });

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

				db.driver.execQuery(sql, arrArgs, function(err, resultData) {
					container.list = resultData;
					container.pagination = utils.paginationMath(pageNo, container.totalPageNum);
                    container.totalPageNum = Math.ceil(listCount / prePageNum);
					//container.pagination = utils.paginationMath(2,11);
					callback(err, container);
				});
			}
		});
	}

    /**
     * 查询逾期合同数量
     * @param params
     * @param callback
     */
    Contract.getOverdueDaysCount = function(params, callback) {
        var sql;

        sql = "select count(*) as overdue_count from contract_info where TIMESTAMPDIFF(DAY, DATE_FORMAT(end_time, '%Y-%m-%d'),NOW()) > 0";

        db.driver.execQuery(sql, function(err, resultData) {
            callback(err, resultData[0].overdue_count);
        });
    }

    /**
     * 添加合同
     * @param params
     * @param callback
     */
    Contract.addContract = function(params, callback) {
        Contract.create(params, function(err, items) {
            if(items)
                callback(err, {status: true, data: items});
            else
                callback(err, {status: false, message: "合同添加失败"});
        });
    }
}