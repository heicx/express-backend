var dictionaryModel = require("../model/firstParty");

exports.fetchFirstPartyList = function(req, res, next) {
	dictionaryModel.get().then(function(lists) {
		res.render("dictionary/firstPartyList", {firstPartyList: lists, userinfo: req.session.userinfo});
	});
}

exports.fetchSecondPartyList = function(req, res, next) {
	dictionaryModel.get().then(function(lists) {
		res.render("dictionary/secondPartyList", {firstPartyList: lists, userinfo: req.session.userinfo});
	});
}