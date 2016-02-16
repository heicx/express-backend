var express = require("express");
var router = express.Router();
var login = require("./login");
var utils = require("../helper/utils");
var contractModel, contractTypeModel, regionModel, firstPartyModel, secondPartyModel;

// 获取合同列表及相关查询数据
var fetchContractList = function (req, res) {
	var async = req.query.async || false;
	var params = req.query;

    contractModel = contractModel || req.models.contract_info;
    contractTypeModel = contractTypeModel || req.models.contract_type;
    regionModel = regionModel || req.models.contract_region;
	contractModel.getContractInfo(params, function(err, contractList) {
        var contract = {data: contractList};

        // 获取逾期合同数量
        contractModel.getOverdueDaysCount({}, function(err, count) {
            contract.overdue_count = count;

            if(async) {
                res.json(contract);
            }else {
                // 获取所有合同类型
                contractTypeModel.getContractTypeList({}, function(err, contractType) {
                    if(!err) {
                        contract.type = contractType;

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
	});
}

// 获取甲方乙方列表
var fetchBothPartiesList = function(req, res) {
    firstPartyModel = firstPartyModel || req.models.contract_first_party;
    secondPartyModel = secondPartyModel || req.models.contract_second_party;

    firstPartyModel.getFirstPartyList({}, function(err, firstParties) {
        if(!err) {
            secondPartyModel.getSecondPartyList({}, function(err, secondParties) {
                if(!err)
                    res.json({status: true, data: {firstParties: firstParties, secondParties: secondParties}});
            })
        }
    });
}

// 添加合同
var addContract = function(req, res) {
    var params = {
        contract_number: req.body.contractNumber,
        first_party_id: req.body.firstPartyId,
        second_party_id: req.body.secondPartyId,
        contract_type: req.body.contractType,
        effective_time: req.body.effectiveTime,
        end_time: req.body.endTime,
        create_time: new Date(),
        deposit: req.body.deposit,
        contract_price: req.body.contractPrice
    };

    contractModel = contractModel || req.models.contract_info;

    params.saler_name = JSON.parse(req.session.user).user_name;
    contractModel.addContract(params, function(err, contract) {
        res.json(contract);
    });
}

router.use(login.islogin);

router.get("/list", fetchContractList);
router.get("/parties", fetchBothPartiesList);
router.post("/add", addContract);

module.exports = router;