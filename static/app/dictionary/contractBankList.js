define(["jquery", "base", "transition", "dimmer", "modal", "popup"], function($, base) {
    $(function() {

        /**
         * 渲染模块
         */
        var render = {
            contractBankList: function(res, cb) {     /** 渲染银行列表 **/
                var strJoint = "";

                if(res.status) {
                    var i = 0;

                    for(; i < res.data.length; i++) {
                        strJoint += "<tr class='center aligned'><td>" + res.data[i].bank_name
                                  + "</td></tr>";
                    }
                }

                cb(strJoint);
            },
            modalMsg: function(msg) {       /** 控制弹出层的提示信息的显示与隐藏 **/
                var _msg = msg || "";

                $("#modalMsg p").html(_msg);

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
            contractBankName : function(name) {
                if(name === "")
                    return {status: false, message: "请输入银行名称"};
                else
                    return {status: true};
            }
        }

        /**
         * 银行名称查询
         */
        $("#queryBtn").on("click", function() {
            var params = {};
            var contractBankName = $("#contractBankName").val();

            params["contractBankName"] = contractBankName;
            base.common.getData(base.api.queryContractBank, params, false, function(resultData) {
                if(resultData.status) {
                    render.contractBankList(resultData, function(str) {
                        $("#contractBankList").html(str);
                    });
                }
            }, function(err) {});
        });

        /**
         * 打开添加合同类型
         */
        $("#addContractBankBtn").on("click", function() {
            $("#contractBankFullName").val("").focus();
            $('#contractBankModal').modal("setting", "transition", "fade down").modal("show");
        });

        /**
         * 确认添加合同类型
         */
        $("#confirmContractBankBtn").on("click", function() {
            var params = {}, oContractBankNameRes;
            var contractBankName = $("#contractBankFullName").val();

            // 对提交信息进行验证
            oContractBankNameRes = validate.contractBankName(contractBankName);
            if(oContractBankNameRes.status) {
                params["contractBankName"] = contractBankName;

                // 添加入账银行
                base.common.postData(base.api.addContractBank, params, false, function(res) {
                    if(res.status) {
                        var i = 0, contractBankItem = "";

                        for(; i < res.data.length; i++) {
                            contractBankItem += "<tr class='center aligned'><td>" + res.data[i].bank_name
                                            + "</td></tr>";
                        }

                        $('#contractBankModal').modal("setting", "transition", "fade down").modal("hide");
                        $("#contractBankList").append(contractBankItem);
                    }else {
                        render.modalMsg(res.message);
                    }
                }, function(err) {});
            }else {
                render.modalMsg(oContractBankNameRes.message);
            }
        });

        /**
         * 监听弹出层的关闭事件
         */
        $('#contractBankModal').modal("setting", "onHide", function() {
            render.modalMsg();
        });
    });
});