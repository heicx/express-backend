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
var genFetchContractInfo = function* (req, params) {
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
 * 1. 添加合同
 * 2. 查询合同详细信息
 * @param params
 */
var genAddContract = function* (params) {
    contractModel = contractModel || req.models.contract_info;

    yield contractModel.addContract(params);
    yield contractModel.getContractInfo({contract_number: params.contract_number, fuzzy: false});
}

/**
 * 生成器
 * 修改合同
 *
 * 步骤:
 * 1. 修改合同
 * 2. 查询合同详细信息
 * @param params
 */
var genModifyContract = function* (req, params) {
    contractModel = contractModel || req.models.contract_info;

    yield contractModel.modifyContract(params);
    yield contractModel.getContractInfo({contract_number: params.contract_number, fuzzy: false});
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
    var gen = genAddContract(params);

    contractModel = contractModel || req.models.contract_info;

    // 检查合同是否已经存在
    contractModel.findContractIsExist(params).then(function() {
        for(var i of gen) {
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
 * 修改合同
 * @param req
 * @param res
 */
var modifyContract = function(req, res) {
    var params = {
        contract_number: req.body.contractNumber,
        first_party_id: req.body.firstPartyId,
        second_party_id: req.body.secondPartyId,
        contract_type: req.body.contractType,
        effective_time: req.body.effectiveTime,
        end_time: req.body.endTime,
        deposit: req.body.deposit,
        contract_price: req.body.contractPrice,
        contract_status: 0
    };
    var gen = genModifyContract(req, params);
    var arrPromise = [];

    for(var i of gen) {
        arrPromise.push(i);
    }

    when.all(arrPromise).then(function(result) {
        res.json({status: true, data: result[1]});
    }).catch (function(errMsg) {
        res.json({status: false, message: errMsg});
    });
}

/**
 * 删除合同
 * @param req
 * @param res
 */
var removeContract = function(req, res) {

}

/**
 * 审核合同
 * @param req
 * @param res
 */
var verifyContract = function(req, res) {
    if(req.body.contractNumber) {
        req.params.fuzzy = false;

        contractModel = contractModel || req.models.contract_info;
        contractModel.verifyContract({contract_number: req.body.contractNumber}).then(function() {
            res.json({status: true, data: "合同审核通过"});
        }).catch(function(errMsg) {
            res.json({status: false, message: errMsg});
        });
    }
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
    var gen = genFetchContractInfo(req, params);

    for(var i of gen) {
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

/**
 * 获取合同详情所需的基础数据
 * @param req
 * @param res
 */
var packContractDetailBasicData = function(req, res) {
    var params = req.params;

    if(params.id) {
        req.params.contract_number = params.id;
        req.params.fuzzy = false;

        contractTypeModel = contractTypeModel || req.models.contract_type;
        var genContractInfo = genFetchContractInfo(req, req.params);

        genContractInfo.next().value.then(function(contract) {
            contractTypeModel.getContractTypeList({}).then(function(typeList) {
                contract.type = typeList;
                res.render("contract/contractDetail", {contract: contract, userinfo: JSON.parse(req.session.user)});
            });
        });
    }else {
        res.status(500).send("合同不存在");
    }
}

router.use(login.islogin);

router.get("/list", packContractBasicData);
router.get("/parties", fetchBothPartiesList);
router.post("/remove/", removeContract);
router.post("/verify/", verifyContract);
router.post("/add", addContract);
router.post("/modify", modifyContract);
router.get("/detail/:id", packContractDetailBasicData);

module.exports = router;