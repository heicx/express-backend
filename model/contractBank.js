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
        var def = when.defer();
        var contractBankName = params.contractBankName || "";

        contractBank.find().where("bank_name like ?", ["%" + contractBankName +"%"]).all(function(err, resultData) {
            if (err)
                def.reject(err);
            else
                def.resolve(resultData);
        });

        return def.promise;
	}

    /**
     * 添加银行
     * @param params(contractBankName: 入账银行名称)
     */
    contractBank.addContractBank = function(params) {
        var def = when.defer();

        // 银行名称查重
        contractBank.find(params, function(err, item) {
            if(!err) {
                if(item.length > 0) {
                    def.reject("入账银行名称已存在");
                }else {
                    // 添加银行
                    contractBank.create(params, function(err, item) {
                        if(item)
                            def.resolve(item);
                        else
                            def.reject("银行添加失败");
                    });
                }
            }else {
                def.reject("入账银行名称查重失败");
            }
        });

        return def.promise;
    }
}