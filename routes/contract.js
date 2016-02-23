var express = require("express");
var router = express.Router();
var when = require("when");

var login = require("./login");
var contractModel, contractTypeModel, regionModel, firstPartyModel, secondPartyModel;

/**
 * 生成器
 * 获取合同列表所需的基础信息
 *
 * 步骤:
 * 1. 获取合同列表
 * 2. 获取逾期合同数量
 * 3. 获取合同类型列表
 * 4. 获取所有大区
 * @param params
 */
var genFetchContractInfo = function* (req) {
    var params = req.query;

    contractModel = contractModel || req.models.contract_info;
    contractTypeModel = contractTypeModel || req.models.contract_type;
    regionModel = regionModel || req.models.contract_region;

    yield contractModel.getContractInfo(params);
    yield contractModel.getOverdueDaysCount({});
    yield contractTypeModel.getContractTypeList({});
    yield regionModel.getAllRegion({});
}


/**
 * 异步接口
 *
 * 获取甲方乙方列表
 * @param req
 * @param res
 */
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

/**
 * 生成器
 * 添加合同
 *
 * 步骤:
 * 1. 合同查重
 * 2. 添加合同
 * 3. 查询合同详细信息
 * @param params
 */
var genAddContract = function* (params) {
    contractModel = contractModel || req.models.contract_info;

    yield contractModel.addContract(params);
    yield contractModel.getContractInfo({contract_number: params.contract_number});
}

/**
 * 数据迭代拼装处理
 *
 * 添加合同
 * @param req
 * @param res
 */
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
        contract_price: req.body.contractPrice,
        saler_name: JSON.parse(req.session.user).user_name
    };
    var arrPromise = [];
    var genContract = genAddContract(params);

    contractModel = contractModel || req.models.contract_info;

    // 检查合同是否已经存在
    contractModel.findContractIsExist(params).then(function() {
        for(var i of genContract) {
            arrPromise.push(i);
        }

        // 添加合同并获取合同信息
        when.all(arrPromise).then(function(result) {
            res.json({status: true, data: result[1]});
        }).catch (function(errMsg) {
            res.json({status: false, message: errMsg});
        });
    }).catch(function(errMsg) {
        res.json({status: false, message: errMsg});
    });
}

/**
 * 数据迭代拼装处理
 *
 * 获取合同列表所需的基础信息
 * @param req
 * @param res
 */
var packContractBasicData = function(req, res) {
    var params = req.query;
    var async = params.async || false;
    var contract = {}, arrPromise = [];
    var genContractInfo = genFetchContractInfo(req);

    for(var i of genContractInfo) {
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
        else {
            res.status(500).send(errMsg);
        }
    });
}

router.use(login.islogin);

router.get("/list", packContractBasicData);
router.get("/parties", fetchBothPartiesList);
router.post("/add", addContract);
router.get("/detail", addContract);

module.exports = router;