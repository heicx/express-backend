var express = require("express");
var router = express.Router();
var login = require("./login");
var depositModel, contractModel;

/**
 * 获取扣除保证金列表数据
 * @param req
 * @param res
 */
var fetchDepositList = function(req, res) {
    var params = {
        contract_number: req.query.contractNumber
    }
    depositModel = depositModel || req.models.contract_deposit_deduct;

    depositModel.getDepositList(params).then(function(list) {
        res.json({status: true, data: list});
    }).catch(function(errMsg) {
        res.json({status: false, message: errMsg});
    });
}

/**
 * 扣除保证金
 * @param req
 * @param res
 */
var deductDeposit = function(req, res) {
    var params = {
        deduct_type: req.body.deductType,
        deduct_price: req.body.deductPrice,
        effective_time: req.body.effectiveTime,
        contract_number: req.body.contractNumber,
        user_id: JSON.parse(req.session.user).id
    };

    contractModel = contractModel || req.models.contract_info;
    depositModel = depositModel || req.models.contract_deposit_deduct;

    contractModel.deductDeposit(params).then(function() {
        depositModel.addRecord(params).then(function(item) {
            res.json({status: true, data: item});
        }).catch(function(errMsg) {
            res.json({status: false, message: errMsg})
        });
    }).catch(function(errMsg) {
        res.json({status: false, message: errMsg})
    });
}

router.use(login.islogin);
router.post("/deduct", deductDeposit);
router.get("/list", fetchDepositList);

module.exports = router;