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

/**
 * 生成器
 * 添加发票
 *
 * @param req
 * 1. 发票查重
 * 2. 添加发票
 */
var genAddInvoice = function* (req) {
    var params = {
        id: req.body.contractNumber,
        invoice_price: req.body.invoicePrice,
        invoice_time: req.body.invoiceTime,
        invoice_number: req.body.invoiceNumber,
        user_id: JSON.parse(req.session.user).id
    }
    contractInvoiceModel = contractInvoiceModel || req.models.contract_invoice;

    yield contractInvoiceModel.findInvoiceIsExist(params);
    yield contractInvoiceModel.addInvoice(params);
}

/**
 * 添加发票
 * @param req
 * @param res
 */
var addInvoice = function(req, res) {
    var invoice = {}, arrPromise = [];
    var gen = genAddInvoice(req);

    for(var i of gen) {
        arrPromise.push(i);
    }

    when.all(arrPromise).then(function(result) {
        invoice = result[1];
        invoice.user_name = JSON.parse(req.session.user).user_name;

        res.json({status: true, data: invoice});
    }).catch (function(errMsg) {
        res.json({status: false, message: errMsg});
    });
}

router.use(login.islogin);

router.get("/list", packInvoiceBasicData);
router.post("/add", addInvoice);

module.exports = router;