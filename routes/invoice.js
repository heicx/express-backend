var express = require("express");
var router = express.Router();
var when = require("when");
var login = require("./login");

var contractInvoiceModel, contractTypeModel;

var genFetchInvoiceInfo = function* (req) {
    var params = req.query;

    contractInvoiceModel = contractInvoiceModel || req.models.contract_invoice;
    contractTypeModel = contractTypeModel || req.models.contract_type;

    yield contractInvoiceModel.getInvoiceInfo(params);
    yield contractTypeModel.getContractTypeList({});
}

var packInvoiceBasicData = function (req, res) {
    var params = req.query;
    var async = params.async || false;
    var invoice = {}, arrPromise = [];
    var genInvoiceInfo = genFetchInvoiceInfo(req);

    for(var i of genInvoiceInfo) {
        arrPromise.push(i);
    }

    when.all(arrPromise).then(function(result) {
        invoice = result[0];
        invoice.type = result[1];

        if(async)
            res.json(invoice);
        else
            res.render("contract/invoiceList", {invoice: invoice, userinfo: JSON.parse(req.session.user)});
    }).catch (function(errMsg) {
        if(async)
            res.json({status: false, message: errMsg});
        else {
            res.status(500).send(errMsg);
        }
    });
}

router.use(login.islogin);

router.get("/list", packInvoiceBasicData);

module.exports = router;