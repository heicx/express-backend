var express = require("express");
var router = express.Router();
var login = require("./login");

// 获取银行列表
var fetchContractBankList = function (req, res, next) {
	var contractBankModel = req.models.contract_bank;
	var async = req.query.async || false;
	var params = req.query;

    contractBankModel.getContractBankList(params, function(err, contractBank) {
		if(async) {
			res.json({status: true, data: contractBank});
		}else{
			res.render("dictionary/contractBank", {contractBankList: contractBank, userinfo: JSON.parse(req.session.user)});
		}
	});
}

// 添加银行
var addContractBank = function(req, res) {
    var contractBankModel = req.models.contract_bank;
    var params = {
        bank_name: req.body.contractBankName
    };

    contractBankModel.addContractBank(params, function(err, contractBank) {
        res.json(contractBank);
    });
}

router.use(login.islogin);

router.get("/list", fetchContractBankList);
router.post("/add", addContractBank);

module.exports = router;