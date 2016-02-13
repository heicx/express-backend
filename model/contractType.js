module.exports = function(orm, db) {
	var contractType = db.define("contract_type", {
		id: {type: "serial", key: true},
		contract_type_name: String
	});

    /**
     * 获取合同类型列表
     * @param params(contract_type_name: 合同类型名称)
     * @param callback
     */
	contractType.getContractTypeList = function(params, callback) {
        var contractTypeName = params.contractTypeName || "";

		contractType.find().where("contract_type_name like ?", ["%" + contractTypeName +"%"]).all(function(err, resultData) {
			callback(err, resultData);
		});
	}

    /**
     * 添加合同
     * @param params(contract_type_name: 合同类型名称)
     * @param callback
     */
    contractType.addContractType = function(params, callback) {
        // 合同类型名称查重
        contractType.find(params, function(err, item) {
            if(!err) {
                if(item.length > 0) {
                    callback(err, {status: false, message: "合同类型名称已存在"});
                }else {
                    // 添加合同类型
                    contractType.create(params, function(err, items) {
                        if(items) {
                            // 获取新增合同类型的信息
                            contractType.getContractTypeList({contractTypeName: items.contract_type_name}, function(err, newItem) {
                                callback(err, {status: true, data: newItem});
                            });
                        }else {
                            callback(err, {status: false, message: "添加失败"})
                        }
                    });
                }
            }else {
                callback(err, {status: false, message: "合同类型名称查重失败"});
            }
        });
    }
}