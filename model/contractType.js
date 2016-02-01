module.exports = function(orm, db) {
	var contractType = db.define("contract_type", {
		id: {type: "serial", key: true},
		contract_type_name: String
	});

	contractType.getContractTypeList = function(params, callback) {
		contractType.find(function(err, resultData) {
			callback(null, resultData);
		});
	}
}