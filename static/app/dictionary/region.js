define(["jquery", "base", "transition", "dimmer", "modal"], function($, base) {
    $(function() {

        /**
         * 渲染模块
         */
        var render = {
            regionItemsList: function(res, cb) {     /** 渲染大区复选项,禁用已选项 **/
                var arrExistArea = res.data.existArea;
                var oAllArea = res.data.allArea;
                var strJoint = "", strProperty = "", _strProperty = "", j = 0;

                if(res["_dataType"] === "edit") {
                    for(var regionName in res.data.region) {
                        strProperty = "checked";
                        $("#regionName").val(regionName);
                    }
                }else {
                    strProperty = "checked disabled";
                    $("#regionName").val("");
                }

                for(; j < oAllArea.length; j++) {
                    _strProperty = (arrExistArea.indexOf(oAllArea[j].id) > -1) ? strProperty : "";

                    strJoint += "<div class='column'><div class='ui checked checkbox'><input type='checkbox' " + _strProperty
                        +  " data-id='" + oAllArea[j].id + "'><label>" + oAllArea[j].area_name + "</label></div></div>";
                }

                cb(strJoint);
            },
            regionList: function() {        /** 渲染大区列表 **/

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
            regionName : function(name) {
                if(name === "")
                    return {status: false, message: "请输入大区名称"};
                else
                    return {status: true};
            },
            areaId : function(arr) {
                if(arr.length === 0)
                    return {status: false, message: "请选择大区所包含的省份"};
                else
                    return {status: true};
            },
            isModify: function(originData, modifyData) {
                if(originData.regionName === modifyData.regionName && this._sort(originData.areaIds) === modifyData.areaIds.toString())
                    return {status: false, message: "数据没有任何变化哦"};
                else
                    return {status: true};
            },
            _sort: function(str) {
                if(typeof str === "string" && str !== "") {
                    return str.split(",").sort(function(a, b) {
                        var _a = parseInt(a), _b = parseInt(b);
                        return _a > _b ? 1 : -1;
                    }).toString();
                }else {
                    return "";
                }
            }
        }

        /**
         * 打开添加大区复选项界面
         */
        $("#addRegionBtn").on("click", function() {
            base.common.getData(base.api.allArea, null, false, function(resultData) {
                render.regionItemsList(resultData, function(str) {
                    $("#regionItems").html(str);
                    $("#confirmRegionBtn").attr("data-type", "add").html("添加");
                    $('#regionModal').modal("setting", "transition", "fade down").modal("show");
                });
            }, function(err) {});
        });

        /**
         * 打开编辑大区复选项界面
         */
        $("#regionList").on("click", ".region-edit", function() {
            var params = {
                region_id: $(this).attr("data-region")
            }

            // 获取所有省份
            base.common.getData(base.api.allArea, params, false, function(resultData) {
                resultData["_dataType"] = "edit";

                render.regionItemsList(resultData, function(str) {
                    $("#regionItems").html(str);

                    $("#confirmRegionBtn").attr({
                        "data-type": "edit",
                        "data-region": params.region_id,
                        "data-area": resultData.data.existArea,
                        "region-name": $("#regionName").val()
                    }).html("更新");
                    $('#regionModal').modal("setting", "transition", "fade down").modal("show");
                });
            }, function(err) {});
        });

        /**
         * 大区复选项的提交 or 更新操作
         */
        $("#confirmRegionBtn").on("click", function() {
            var params = {}, i = 0, arrAreaId = [], oCheckAreaIdRes, oCheckRegionNameRes;
            var type = $(this).attr("data-type");
            var regionName = $("#regionName").val();
            var $checkedArea = $("#regionItems").find(".checkbox input:checked").not("input:disabled");

            for(; i < $checkedArea.length; i++) {
                arrAreaId.push($checkedArea.eq(i).attr("data-id"));
            }

            // 对提交信息进行验证
            oCheckRegionNameRes = validate.regionName(regionName);
            oCheckAreaIdRes = validate.areaId(arrAreaId);

            if(oCheckRegionNameRes.status && oCheckAreaIdRes.status) {
                params["regionName"] = regionName;
                params["areaIds"] = arrAreaId;

                if(type === "add") {
                    // 添加大区
                    base.common.postData(base.api.addRegion, params, false, function(resultData) {
                        if(resultData.status) {
                            var regionItem = "", i = 0, areaItem = "";
                            var newRegion = resultData.data;

                            for(regionName in newRegion) {
                                for(; i < newRegion[regionName].area_name.length; i++) {
                                    areaItem += newRegion[regionName].area_name[i] + ",";
                                }

                                regionItem += "<tr class='center aligned' data-region='" + newRegion[regionName].region_id + "'><td>"
                                            + regionName + "</td><td>" + areaItem.substring(0, areaItem.length -1)
                                            + "</td><td><button data-region='" + newRegion[regionName].region_id + "' "
                                            + "class='ui primary aligned button region-edit'>编辑</button></td></tr>";
                            }

                            $('#regionModal').modal("setting", "transition", "fade down").modal("hide");
                            $("#regionList").append(regionItem);
                        }else {
                            render.modalMsg(resultData.message);
                        }
                    }, function(err) {});
                }else if(type === "edit") {
                    // 编辑大区
                    var originData = {
                        regionName: $(this).attr("region-name"),
                        areaIds: $(this).attr("data-area")
                    }
                    var regionModify = validate.isModify(originData, params);

                    if(regionModify.status) {
                        params["regionId"] = $(this).attr("data-region");
                        base.common.postData(base.api.editRegion, params, false, function(resultData) {
                            if(resultData.status) {
                                var $regionItem, strRegionName = "", strAreaName = "";

                                for(var name in resultData.data) {
                                    $regionItem = $("#regionList tr[data-region=" + resultData.data[name].region_id + "]");

                                    strRegionName = name;
                                    strAreaName = resultData.data[name].area_name.join(",");
                                }

                                $regionItem.find("td").eq(0).html(strRegionName);
                                $regionItem.find("td").eq(1).html(strAreaName);

                                $('#regionModal').modal("setting", "transition", "fade down").modal("hide");
                            }
                        }, function(err) {});
                    }else {
                        render.modalMsg(regionModify.message);
                    }
                }
            }else {
                render.modalMsg(oCheckRegionNameRes.message || oCheckAreaIdRes.message);
            }
        });

        /**
         * 监听弹出层的关闭事件
         */
        $('#regionModal').modal("setting", "onHide", function() {
            render.modalMsg();
        });
    });
});