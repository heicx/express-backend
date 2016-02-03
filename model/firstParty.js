module.exports = function(orm, db) {
	var firstParty = db.define("contract_first_party", {
		id: {type: "serial", key: true},
		first_party_name: String,
		region_id: Number,
		province_id: Number,
		city_id: Number,
		district_id: Number
	});

	firstParty.getFirstPartyList = function(params, callback) {
		var sql = "select a.first_party_name, b.region_name, d.area_name from contract_first_party a "
				+ "left join contract_region b on b.id = a.region_id "
				+ "left join contract_region_area c on c.region_id = b.id "
				+ "left join area d on d.id = c.area_id";

		db.driver.execQuery(sql, function(err, resultData) {
			callback(err, resultData);
		});
	}
}