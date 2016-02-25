var express = require("express");
var router = express.Router();
var login = require("./login");
var when = require("when");

// 获取合同类型数据
var fetchContractTypeList = function (req, res, next) {
	var contractTypeModel = req.models.contract_type;
	var async = req.query.async || false;
	var params = req.query;

	contractTypeModel.getContractTypeList(params).then(function(contractType) {
		if(async) {
			res.json({status: true, data: contractType});
		}else {
            res.render("dictionary/contractType", {contractTypeList: contractType, userinfo: JSON.parse(req.session.user)});
        }
	}).catch(function(errMsg) {
        if(async) {
            res.json({status: false, message: errMsg});
        }else {
            res.status(500).send(errMsg);
        }
    });
}

// 添加合同类型
var addContractType = function(req, res) {
    var contractTypeModel = req.models.contract_type;
    var params = {
        contract_type_name: req.body.contractTypeName
    };

    var arrPromise = [contractTypeModel.findContractTypeIsExists(params), contractTypeModel.createContractType(params)];

    when.all(arrPromise).then(function(result) {
        var itemAdded = result[1];

        contractTypeModel.getContractTypeByName(itemAdded).then(function(newItem) {
            res.json({status: true, data: newItem});
        }).catch(function(errMsg) {
            res.json({status: false, message: errMsg});
        });
    }).catch(function(errMsg) {
        res.json({status: false, message: errMsg});
    });
}

router.use(login.islogin);

router.get("/list", fetchContractTypeList);
router.post("/add", addContractType);

module.exports = router;