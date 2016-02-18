var express = require("express");
var router = express.Router();
var login = require("./login");
var when = require("when");
var contractModel, contractTypeModel, regionModel, firstPartyModel, secondPartyModel;

// 获取合同列表及相关查询数据
var fetchContractInfo = function* (req) {
    var params = req.query;

    contractModel = contractModel || req.models.contract_info;
    contractTypeModel = contractTypeModel || req.models.contract_type;
    regionModel = regionModel || req.models.contract_region;

    yield contractModel.getContractInfo(params);
    yield contractModel.getOverdueDaysCount({});
    yield contractTypeModel.getContractTypeList({});
    yield regionModel.getAllRegion({});
}


// 获取甲方乙方列表
var fetchBothPartiesList = function(req, res) {
    firstPartyModel = firstPartyModel || req.models.contract_first_party;
    secondPartyModel = secondPartyModel || req.models.contract_second_party;

    firstPartyModel.getFirstPartyList({}).then(function(firstParties) {
        secondPartyModel.getSecondPartyList({}, function(err, secondParties) {
            if(!err)
                res.json({status: true, data: {firstParties: firstParties, secondParties: secondParties}});
        });
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

    // 验证合同是否已存在
    contractModel.findContractIsExist(params).then(function() {
        params.saler_name = JSON.parse(req.session.user).user_name;
        contractModel.addContract(params, function(err, contract) {
            res.json(contract);
        });
    }).catch(function(errMsg) {
        res.json({status: false, message: errMsg});
    });
}

// 拼装合同预加载数据
var packContractBasicData = function(req, res) {
    var params = req.query;
    var async = params.async || false;
    var contract = {}, arrPromise = [];
    var itrContractInfo = fetchContractInfo(req);

    for(var i of itrContractInfo) {
        arrPromise.push(i);
    }

    when.all(arrPromise).then(function(result) {
        contract = result[0];
        contract.overdue_count = result[1];
        contract.type = result[2];
        contract.region = result[3];

        if(async)
            res.json(contract);
        else
            res.render("contract/contractList", {contract: contract, userinfo: JSON.parse(req.session.user)});
    }).catch (function(errMsg) {
        if(async)
            res.json({status: false, message: errMsg});
        else
            res.status(500).send(errMsg);
    });
}

router.use(login.islogin);

router.get("/list", packContractBasicData);
router.get("/parties", fetchBothPartiesList);
router.post("/add", addContract);

module.exports = router;