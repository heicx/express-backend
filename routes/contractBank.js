var express = require("express");
var router = express.Router();
var login = require("./login");

/**
 * 获取银行列表
 * @param req
 * @param res
 */
var fetchContractBankList = function (req, res) {
	var contractBankModel = req.models.contract_bank;
	var async = req.query.async || false;
	var params = req.query;

    contractBankModel.getContractBankList(params).then(function(contractBank) {
		if(async) {
			res.json({status: true, data: contractBank});
		}else{
			res.render("dictionary/contractBank", {contractBankList: contractBank, userinfo: JSON.parse(req.session.user)});
		}
	}).catch(function(errMsg) {
        res.json({status: false, message: errMsg});
    });
}

/**
 * 添加银行
 * @param req
 * @param res
 */
var addContractBank = function(req, res) {
    var contractBankModel = req.models.contract_bank;
    var params = {
        bank_name: req.body.contractBankName
    };

    contractBankModel.addContractBank(params).then(function(contractBank) {
        res.json({status: true, data: contractBank});
    }).catch(function(errMsg) {
        res.json({status: false, message: errMsg});
    });
}

router.use(login.islogin);

router.get("/list", fetchContractBankList);
router.post("/add", addContractBank);

module.exports = router;