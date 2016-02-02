define(["jquery", "base", "transition", "dimmer", "modal"], function($, base) {
    $(function() {
        var render = {
            regionItemsList: function(resultData, cb) {     /** 渲染大区复选项,禁用已选项 **/
                var arrExistArea = resultData.existArea;
                var oAllArea = resultData.allArea;
                var strJoint = "", strProperty = "", _strProperty = "", j = 0;

                if(resultData["_dataType"] === "edit") {
                    for(var regionName in resultData.region) {
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

            }
        }

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
            }
        }

        /**
         * 打开添加大区复选项界面
         */
        $("#addRegionBtn").on("click", function() {
            base.common.getData(base.api.region, null, false, function(resultData) {
                render.regionItemsList(resultData, function(str) {
                    $("#regionItems").html(str);
                    $("#confirmRegionBtn").attr("data-type", "add").html("添加");
                    $('#regionModal').modal('show');
                });
            }, function(err) {});
        });

        /**
         * 打开编辑大区复选项界面
         */
        $(".region-edit").on("click", function() {
            var params = {
                region_id: $(this).data("regionid")
            }

            base.common.getData(base.api.region, params, false, function(resultData) {
                resultData["_dataType"] = "edit";

                render.regionItemsList(resultData, function(str) {
                    $("#regionItems").html(str);
                    $("#confirmRegionBtn").attr("data-type", "edit").html("更新");
                    $('#regionModal').modal('show');
                });
            }, function(err) {});
        });

        /**
         * 大区复选项的提交 or 更新操作
         */
        $("#confirmRegionBtn").on("click", function() {
            var params = {}, i = 0, arrAreaId = [], oCheckAreaIdRes, oCheckRegionNameRes;
            var type = $(this).data("type");
            var regionName = $("#regionName").val();
            var $checkedArea = $("#regionItems").find(".checkbox input:checked").not("input:disabled");

            for(; i < $checkedArea.length; i++) {
                arrAreaId.push($checkedArea.eq(i).data("id"));
            }

            oCheckRegionNameRes = validate.regionName(regionName);
            oCheckAreaIdRes = validate.areaId(arrAreaId);

            if(oCheckRegionNameRes.status && oCheckAreaIdRes.status) {
                params["regionName"] = regionName;
                params["areaIds"] = arrAreaId;

                if(type === "add") {
                    base.common.postData(base.api.addRegion, params, false, function(resultData) {
                        console.log(resultData);
                    }, function(err) {});
                }else if(type === "edit") {
                    base.common.postData(base.api.editRegion, params, false, function(resultData) {
                        render.regionItemsList(resultData, function(str) {
                            $("#regionItems").html(str);
                            $("#confirmRegionBtn").attr("data-type", "edit").html("更新");
                            $('#regionModal').modal('show');
                        });
                    }, function(err) {});
                }
            }else {
                alert(oCheckRegionNameRes.message || oCheckAreaIdRes.message);
            }
        });
    });
});