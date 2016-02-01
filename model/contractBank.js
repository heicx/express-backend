module.exports = function(orm, db) {
	var contractBank = db.define("contract_bank", {
		id: {type: "serial", key: true},
		bank_name: String
	});

    contractBank.getContractBankList = function(params, callback) {
        contractBank.find(function(err, resultData) {
			callback(null, resultData);
		});
	}
}