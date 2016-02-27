var express = require("express");
var router = express.Router();
var login = require('./login');
var when = require('when');
var contractPaymentModel, contractTypeModel, regionModel, contractBankModel, contractModel;


/**
 * 数据封装
 * 获取回款列表
 *
 * @param req
 */
var fetchContractPaymentData = function (req, res) {
    var params = req.query;
    var async = params.async || false;
    var contract = {}, arrPromise = [];

    if(params.fuzzy === "false") {
        var genPayment = genFetchContractPayment(req);

        genPayment.next().value.then(function(result) {
            res.json(result);
        }).catch(function(errMsg) {
            res.json({status: false, message: errMsg});
        });
    }else {
        for (var i of genFetchContractPayment(req)) {
            arrPromise.push(i);
        }

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
}


/**
 * 生成器
 * 获取回款列表
 * @param req
 */
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

var genAddPayment = function* (req) {
    var params = req.body;
    contractPaymentModel = contractPaymentModel || req.models.contract_payment;
    contractModel = contractModel || req.models.contract_info;

    yield contractModel.updateContractPrice(params);
}

/**
 * 添加回款
 * @param req
 * @param res
 */
var addPayment = function(req, res) {
    var gen = genAddPayment(req);
    contractPaymentModel = contractPaymentModel || req.models.contract_payment;

    gen.next().value.then(function(ret) {
        res.json({status: true, data: ret});
    }).catch(function(errMsg) {
        res.json(errMsg);
    });
    //var gen = genAddPayment(req);
}

router.use(login.islogin);

router.get("/list", fetchContractPaymentData);
router.post("/add", addPayment);

module.exports = router;