var express = require("express");
var router = express.Router();
var login = require("./login");

// 获取合同类型数据
var fetchContractTypeList = function (req, res, next) {
	var contractTypeModel = req.models.contract_type;
	var async = req.query.async || false;
	var params = req.query;

	contractTypeModel.getContractTypeList(params, function(err, contractType) {
		if(async) {
			res.json({status: true, data: contractType});
		}else {
            res.render("dictionary/contractType", {contractTypeList: contractType, userinfo: JSON.parse(req.session.user)});
        }
	});
}

// 添加合同类型
var addContractType = function(req, res) {
    var contractTypeModel = req.models.contract_type;
    var params = {
        contract_type_name: req.body.contractTypeName
    };

    contractTypeModel.addContractType(params, function(err, contractType) {
        res.json(contractType);
    });
}

router.use(login.islogin);

router.get("/list", fetchContractTypeList);
router.post("/add", addContractType);

module.exports = router;