define(["jquery", "base", "transition", "dimmer", "modal", "popup"], function($, base) {
    $(function() {
        /**
         * 渲染模块
         */
        var render = {
            secondPartyList: function(res, cb) {     /** 渲染乙方列表 **/
                var strJoint = "", i = 0;

                for(; i < res.length; i++) {
                    strJoint += "<tr class='center aligned'><td>" + res[i].second_party_name
                              + "</td></tr>";
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
            secondPartyName : function(name) {
                if(name === "")
                    return {status: false, message: "请输入乙方名称"};
                else
                    return {status: true};
            }
        }

        /**
         * 乙方名称查询
         */
        $("#queryBtn").on("click", function() {
            var params = {};
            var secondPartyName = $("#secondPartyName").val();

            params["second_party_name"] = secondPartyName;
            base.common.getData(base.api.querySecondParty, params, false, function(resultData) {
                render.secondPartyList(resultData, function(str) {
                    $("#secondPartyList").html(str);
                });
            }, function(err) {});
        });

        /**
         * 打开添加乙方
         */
        $("#addSecondPartyBtn").on("click", function() {
            $("#secondPartyFullName").val("").focus();
            $('#secondPartyModal').modal("setting", "transition", "fade down").modal("show");
        });

        /**
         * 确认添加乙方
         */
        $("#confirmSecondPartyBtn").on("click", function() {
            var params = {}, oSecondPartyNameRes;
            var secondPartyName = $("#secondPartyFullName").val();

            // 对提交信息进行验证
            oSecondPartyNameRes = validate.secondPartyName(secondPartyName);

            if(oSecondPartyNameRes.status) {
                params["secondPartyName"] = secondPartyName;

                // 添加乙方
                base.common.postData(base.api.addSecondParty, params, false, function(res) {
                    if(res.status) {
                        var i = 0, secondPartyItem = "";

                        for(; i < res.data.length; i++) {
                            secondPartyItem += "<tr class='center aligned'><td>" + res.data[i].second_party_name
                                            + "</td></tr>";
                        }

                        $('#secondPartyModal').modal("setting", "transition", "fade down").modal("hide");
                        $("#secondPartyList").append(secondPartyItem);
                    }else {
                        render.modalMsg(res.message);
                    }
                }, function(err) {});
            }else {
                render.modalMsg(oSecondPartyNameRes.message);
            }
        });

        /**
         * 监听弹出层的关闭事件
         */
        $('#secondPartyModal').modal("setting", "onHide", function() {
            render.modalMsg();
        });
    });
});