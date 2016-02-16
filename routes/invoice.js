var express = require("express");
var router = express.Router();
var login = require("./login");
var contractInvoiceModel;

var fetchInvoiceList = function (req, res, next) {
	var async = req.query.async || false;
	var params = req.query;

    contractInvoiceModel = contractInvoiceModel || req.models.contract_invoice;
}

router.use(login.islogin);

router.get("/list", fetchInvoiceList);

module.exports = router;