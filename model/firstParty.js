module.exports = function(orm, db) {
	var firstParty = db.define("contract_first_party", {
		id: {type: "serial", key: true},
		firstPartyName: {type: "text", mapsTo: "first_party_name"},
		regionId: {type: "integer", mapsTo: "region_id"},
		provinceId: {type: "integer", mapsTo: "province_id"},
		cityId: {type: "integer", mapsTo: "city_id"},
		districtId: {type: "integer", mapsTo: "district_id"}
	})
}