define(["jquery", "base", "transition", "dimmer", "modal", "popup"], function($, base) {
    $(function() {

        /**
         * 渲染模块
         */
        var render = {
            contractTypeList: function(res, cb) {     /** 渲染合同类型列表 **/
                var strJoint = "";

                if(res.status) {
                    var i = 0;

                    for(; i < res.data.length; i++) {
                        strJoint += "<tr class='center aligned'><td>" + res.data[i].contract_type_name
                                  + "</td></tr>";
                    }
                }

                cb(strJoint);
            },
            modalMsg: function(msg) {       /** 控制弹出层的提示信息的显示与隐藏 **/
                var _msg = msg || "";

                $("#modalMsgTips").html(_msg);

                if(_msg === "") {
                    $("#modalMsg").removeClass("hidden").transition("fade");
                }else {
                    $("#modalMsg").closest(".hidden").transition("fade");
                }
            }
        }

        /**
         * 验证模块
         */
        var validate = {
            contractTypeName : function(name) {
                if(name === "")
                    return {status: false, message: "请输入合同类型名称"};
                else
                    return {status: true};
            }
        }

        /**
         * 合同类型名称查询
         */
        $("#queryBtn").on("click", function() {
            var params = {};
            var contractTypeName = $("#contractTypeName").val();

            params["contractTypeName"] = contractTypeName;
            base.common.getData(base.api.queryContractType, params, false, function(resultData) {
                if(resultData.status) {
                    render.contractTypeList(resultData, function(str) {
                        $("#contractTypeList").html(str);
                    });
                }
            }, function(err) {});
        });

        /**
         * 打开添加合同类型
         */
        $("#addContractTypeBtn").on("click", function() {
            $("#contractTypeFullName").val("").focus();
            $('#contractTypeModal').modal("setting", "transition", "fade down").modal("show");
        });

        /**
         * 确认添加合同类型
         */
        $("#confirmContractTypeBtn").on("click", function() {
            var params = {}, oContractTypeNameRes;
            var contractTypeName = $("#contractTypeFullName").val();

            // 对提交信息进行验证
            oContractTypeNameRes = validate.contractTypeName(contractTypeName);
            if(oContractTypeNameRes.status) {
                params["contractTypeName"] = contractTypeName;

                // 添加合同类型
                base.common.postData(base.api.addContractType, params, false, function(res) {
                    if(res.status) {
                        var i = 0, contractTypeItem = "";

                        for(; i < res.data.length; i++) {
                            contractTypeItem += "<tr class='center aligned'><td>" + res.data[i].contract_type_name
                                            + "</td></tr>";
                        }

                        $('#contractTypeModal').modal("setting", "transition", "fade down").modal("hide");
                        $("#contractTypeList").append(contractTypeItem);
                    }else {
                        render.modalMsg(res.message);
                    }
                }, function(err) {});
            }else {
                render.modalMsg(oContractTypeNameRes.message);
            }
        });

        /**
         * 监听弹出层的关闭事件
         */
        $('#contractTypeModal').modal("setting", "onHide", function() {
            render.modalMsg();
        });
    });
});