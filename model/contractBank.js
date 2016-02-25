var when = require("when");
module.exports = function(orm, db) {
	var contractBank = db.define("contract_bank", {
		id: {type: "serial", key: true},
		bank_name: String
	});

    /**
     * 获取入账银行
     * @param params(contractBankName: 入账银行名称)
     * @param callback
     */
    contractBank.getContractBankList = function(params) {
        var contractBankName = params.contractBankName || "";
        var def = when.defer();
        contractBank.find().where("bank_name like ?", ["%" + contractBankName +"%"]).all(function(err, resultData) {
            if (err)
                def.reject(err);
            else
                def.resolve(resultData);
        });
        return def.promise;
	}

    /**
     * 添加合同
     * @param params(contractBankName: 入账银行名称)
     * @param callback
     */
    contractBank.addContractBank = function(params, callback) {
        // 合同类型名称查重
        contractBank.find(params, function(err, item) {
            if(!err) {
                if(item.length > 0) {
                    callback(err, {status: false, message: "入账银行名称已存在"});
                }else {
                    // 添加合同类型
                    contractBank.create(params, function(err, items) {
                        if(items) {
                            // 获取新增合同类型的信息
                            contractBank.getContractBankList({contractBankName: items.bank_name}, function(err, newItem) {
                                callback(err, {status: true, data: newItem});
                            });
                        }else {
                            callback(err, {status: false, message: "添加失败"})
                        }
                    });
                }
            }else {
                callback(err, {status: false, message: "入账银行名称查重失败"});
            }
        });
    }
}