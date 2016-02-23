var express = require("express");
var router = express.Router();
var login = require('./login');
var when = require('when');

var contractPaymentModel, contractTypeModel, regionModel, contractBankModel;
var fetchContractPaymentData = function (req, res, next) {
    var params = req.query;
    var async = params.async || false;
    var contract = {}, arrPromise = [];
    for (var i of genFetchContractPayment(req)) {
        arrPromise.push(i);
    }
    var contract = {};
    when.all(arrPromise).then(function(result) {
        contract.payment = result[0];
        contract.type = result[1];
        contract.bank = result[2];
        contract.region = result[3];
        if(async)
            res.json(contract);
        else
            res.render("contract/receiveList", {contract: contract, userinfo: JSON.parse(req.session.user)});
    }).catch (function(errMsg) {
        if(async)
            res.json({status: false, message: errMsg});
        else {
            res.status(500).send(errMsg);
        }
    });

}

var genFetchContractPayment = function* (req) {
    var params = req.query;

    contractPaymentModel = contractPaymentModel || req.models.contract_payment;
    contractTypeModel = contractTypeModel || req.models.contract_type;
    regionModel = regionModel || req.models.contract_region;
    contractBankModel = contractBankModel || req.models.contract_bank;

    yield contractPaymentModel.getList(params);
    yield contractTypeModel.getContractTypeList({});
    yield contractBankModel.getContractBankList({});
    yield regionModel.getAllRegion({});
};

router.use(login.islogin);

router.get("/list", fetchContractPaymentData);
module.exports = router;