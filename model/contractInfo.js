var utils = require("../helper/utils");

module.exports = function(orm, db) {
	var Contract = db.define("contract_info", {
		id: {type: "serial", key: true},
		contract_number: String,
		first_party_id: Number,
		second_party_id: Number,
		contract_type: Number,
		effective_time: Date,
		end_time: Date,
		create_time: Date,
		paid_price: Number,
		deposit: Number,
		contract_price: Number,
		deposit_remaining: Number,
		saler_name: String,
		contract_status: Number
	})

	Contract.getContractInfo = function (params, callback) {
		var pageNo = params.pageNo || 1;
		var prePageNum = 20;
		var strWhere = "";
		var container = {
			pageIndex: pageNo
		}

		utils.paramsFilter(params, function(data) {
			for(var name in data) {
				strWhere += name + "=" + data[name] + " and ";
			}

			if(strWhere !== "") {
				strWhere = "where " + strWhere.substring(0, strWhere.length - 4);
			}
		});


		Contract.count(function(err, listCount) {
			container.count = listCount;

			if(listCount == 0) {
				container.totalPageNum = 0;

				callback(null, container);
			}else {
				container.totalPageNum = Math.ceil(listCount / prePageNum);

				var sql = "SELECT a.contract_number, b.first_party_name, c.second_party_name, d.contract_type_name,TIMESTAMPDIFF(DAY,DATE_FORMAT(a.end_time, '%Y-%m-%d'),NOW()) AS overdue_days,"
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
					+ strWhere
					+ "GROUP BY a.contract_number LIMIT ?,?";

				db.driver.execQuery(sql, [(pageNo - 1) * prePageNum, prePageNum], function(err, resultData) {
					container.list = resultData;
					container.pagination = utils.paginationMath(pageNo, container.totalPageNum);
					//container.pagination = utils.paginationMath(2,11);
					callback(err, container);
				});
			}
		});
	}
}