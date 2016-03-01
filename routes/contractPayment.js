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
    var userInfo = JSON.parse(req.session.user);

    contractPaymentModel = contractPaymentModel || req.models.contract_payment;
    contractTypeModel = contractTypeModel || req.models.contract_type;
    regionModel = regionModel || req.models.contract_region;
    contractBankModel = contractBankModel || req.models.contract_bank;

    if(userInfo.user_type !== 1)
        params.user_id = userInfo.id;

    yield contractPaymentModel.getList(params);
    yield contractTypeModel.getContractTypeList({});
    yield contractBankModel.getContractBankList({});
    yield regionModel.getAllRegion({});
};

/**
 * 生成器
 * 添加回款
 *
 * 1. 添加回款记录
 * 2. 获取回款记录
 * @param req
 */
var genAddPayment = function* (req) {
    var params = {
        contract_number: req.body.contractNumber,
        bank_id: req.body.bankId,
        payment: req.body.payment,
        payment_time: req.body.paymentTime,
        user_id: JSON.parse(req.session.user).id,
        payment_type: req.body.paymentType
    }
    contractPaymentModel = contractPaymentModel || req.models.contract_payment;

    yield contractPaymentModel.addItem(params);
    yield contractPaymentModel.getList({contract_number: params.contract_number, fuzzy: false});
}

/**
 * 添加回款
 * @param req
 * @param res
 */
var addPayment = function(req, res) {
    var params = req.body;
    var arrPromise = [];
    contractModel = contractModel || req.models.contract_info;

    contractModel.updateContractPrice(params).then(function() {
        for (var i of genAddPayment(req)) {
            arrPromise.push(i);
        }

        when.all(arrPromise).then(function(result) {
            res.json({status: true, data: result[1]});
        }).catch (function(errMsg) {
            res.json({status: false, message: errMsg});
        });
    }).catch(function(errMsg) {
        res.json({status: false, message: errMsg});
    });
}

router.use(login.islogin);

router.get("/list", fetchContractPaymentData);
router.post("/add", addPayment);

module.exports = router;