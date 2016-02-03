module.exports = function(orm, db) {
	var secondParty = db.define("contract_second_party", {
		id: {type: "serial", key: true},
		second_party_name: String
	});

	secondParty.getSecondPartyList = function(params, callback) {
		secondParty.find(function(err, resultData) {
			callback(err, resultData);
		});
	}
}