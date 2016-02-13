var express = require("express");
var router = express.Router();
var login = require("./login");
var contractModel, contractTypeModel, regionModel;

var fetchContractList = function (req, res, next) {
	var async = req.query.async || false;
	var params = req.query;

    contractModel = contractModel || req.models.contract_info;
    contractTypeModel = contractTypeModel || req.models.contract_type;
    regionModel = regionModel || req.models.contract_region;
	contractModel.getContractInfo(params, function(err, contractList) {
        var contract = {data: contractList};

		if(async) {
			res.json(contract);
		}else {
            // 获取所有合同类型
            contractTypeModel.getContractTypeList({}, function(err, contractType) {
                if(!err) {
                    contract.type = contractType

                    // 获取所有大区
                    regionModel.getAllRegion({}, function(err, region) {
                        if(!err) {
                            contract.region = region;
                            res.render("contract/contractList", {contract: contract, userinfo: JSON.parse(req.session.user)});
                        }
                    });
                }
            });
        }
	});
}

router.get("/list", login.islogin, fetchContractList);

module.exports = router;