define(["jquery", "base", "transition", "dimmer", "modal", "popup"], function($, base) {
    $(function() {
        /**
         * 渲染模块
         */
        var render = {
            firstPartyList: function(arr, cb) {     /** 渲染甲方列表 **/
                var strJoint = "";

                arr = (typeof arr === "object"&& Object.prototype.toString.call(arr).toLowerCase() === "[object object]") ? [arr]: arr;
                arr.forEach(function(data) {
                    strJoint += "<tr class='center aligned'><td>" + data.first_party_name
                        + "</td><td>" + data.region_name + "-" + data.area_name
                        + "-" + data.city_name + "</td></tr>";
                });

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
            firstPartyName : function(name) {
                if(name === "")
                    return {status: false, message: "请输入甲方名称"};
                else
                    return {status: true};
            },
            areaItems: function(areaArr) {
                var i = 0;
                var promise = {
                    status: true
                }

                if(areaArr.length > 0) {
                    for(; i < areaArr.length; i++) {
                        if(!areaArr[i]) {
                            promise.status = false;
                            promise.message = "请选择地区";
                            break;
                        }
                    }

                    return promise;
                }
            }
        }

        /**
         * 甲方名称查询
         */
        $("#queryBtn").on("click", function() {
            var params = {};
            var firstPartyName = $("#firstPartyName").val();

            params["first_party_name"] = firstPartyName;
            base.common.getData(base.api.queryFirstParty, params, false, function(resultData) {
                if(resultData.status) {
                    render.firstPartyList(resultData.data, function(str) {
                        $("#firstPartyList").html(str);
                    });
                }
            }, function(err) {});
        });

        /**
         * 打开添加甲方
         */
        $("#addFirstPartyBtn").on("click", function() {
            $("#firstPartyFullName").val("").focus();
            $('#firstPartyModal').modal("setting", "transition", "fade down").modal("show");
        });

        /**
         * 确认添加甲方
         */
        $("#confirmFirstPartyBtn").on("click", function() {
            var params = {}, oFirstPartyNameRes, oAreaRes;
            var firstPartyName = $("#firstPartyFullName").val();
            var regionId = $("#regionDropdown option:selected").val();
            var provinceId = $("#provinceDropdown option:selected").val();
            var cityId = $("#cityDropdown option:selected").val();
            var arrArea = [regionId, provinceId, cityId];

            // 对提交信息进行验证
            oFirstPartyNameRes = validate.firstPartyName(firstPartyName);
            oAreaRes = validate.areaItems(arrArea);

            if(oFirstPartyNameRes.status && oAreaRes.status) {
                params["firstPartyName"] = firstPartyName;
                params["regionId"] = regionId;
                params["provinceId"] = provinceId;
                params["cityId"] = cityId;

                // 添加甲方
                base.common.postData(base.api.addFirstParty, params, false, function(res) {
                    if(res.status) {
                        render.firstPartyList(res.data, function(str) {
                            $("#firstPartyList").prepend(str);
                        });

                        $('#firstPartyModal').modal("setting", "transition", "fade down").modal("hide");
                    }else {
                        render.modalMsg(res.message);
                    }
                }, function(err) {});
            }else {
                render.modalMsg(oFirstPartyNameRes.message || oAreaRes.message);
            }
        });


        /**
         * 选择大区
         */
        $("#regionDropdown").change(function() {
            var params = {
                region_id: $(this).val()
            }

            base.common.getData(base.api.getProvince, params, false, function(resultData) {
                var i = 0;
                var oProvince = resultData.province;
                var strOptions = "<option value=''>请选择省</option>";


                for(; i < oProvince.length; i++) {
                    strOptions += "<option value='" + oProvince[i].area_id + "'>" + oProvince[i].province_name + "</option>";
                }

                $("#provinceDropdown").html(strOptions);
            }, function(err) {});
        });

        /**
         * 选择省份
         */
        $("#provinceDropdown").change(function() {
            var params = {
                area_id: $(this).val()
            }

            base.common.getData(base.api.getCity, params, false, function(resultData) {
                var i = 0;
                var oProvince = resultData.city;
                var strOptions = "<option value=''>请选择市</option>";


                for(; i < oProvince.length; i++) {
                    strOptions += "<option value='" + oProvince[i].id + "'>" + oProvince[i].city_name + "</option>";
                }

                $("#cityDropdown").html(strOptions);
            }, function(err) {});
        });

        /**
         * 监听弹出层的关闭事件
         */
        $('#firstPartyModal').modal("setting", "onHide", function() {
            render.modalMsg();
        });
    });
});