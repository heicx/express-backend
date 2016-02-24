define(["jquery", "jquery-ui", "base", "transition", "dimmer", "modal", "popup", "dropdown"], function($, ui, base) {
	$(function() {
        var render = {
            modifyDetail: function(arr, cb) {
                var strJoint = "", contractStatus = "";

                arr.forEach(function(data) {
                    switch(data.contract_status) {
                        case 0:
                            contractStatus = "待生效";
                            break;
                        case 1:
                            contractStatus = "执行中";
                            break;
                        case 2:
                            contractStatus = "完结";
                            break;
                        case 3:
                            contractStatus = "逾期";
                            break;
                    }

                    strJoint += "<tr><td class='collapsing'>合同编号: <span>" + data.contract_number + "</span></td>"
                              + "<td class='collapsing'>合同金额: <span> " + data.contract_price + "</span></td></tr>"
                              + "<tr><td class='collapsing'>甲方名称: <span>" + data.first_party_name + "</span></td>"
                              + "<td class='collapsing'>保证金: <span> " + (data.deposit ? data.deposit + " 元" : "暂无") + "</span></td></tr>"
                              + "<tr><td class='collapsing'>甲方地区: <span>" + (data.region_name + "-" + data.province_name + "-" + data.city_name) + "</span></td>"
                              + "<td class='collapsing'>应付总额: <span> " + data.contract_price + data.deposit + " 元" + "</span></td></tr>"
                              + "<tr><td class='collapsing'>乙方名称: <span>" + data.second_party_name + "</span></td>"
                              + "<td class='collapsing'>已付金额: <span> " + data.paid_price + "</span></td></tr>"
                              + "<tr><td class='collapsing'>合同类型: <span>" + data.contract_type_name + "</span></td>"
                              + "<td class='collapsing'>待付金额: <span> " + (data.contract_price + data.deposit - data.paid_price + " 元") + "</span></td></tr>"
                              + "<tr><td class='collapsing'>生效时间: <span>" + data.effective_time + "</span></td>"
                              + "<td class='collapsing'>已开票金额: <span> " + (data.invoice_price ? (data.invoice_price  + "元") : "0 元") + "</span></td></tr>"
                              + "<tr><td class='collapsing'>结束时间: <span>" + data.end_time + "</span></td>"
                              + "<td class='collapsing'>合同状态: <span> " + contractStatus + "</span></td></tr>"
                              + "<tr><td class='collapsing'>对应销售: <span>" + data.saler_name + "</span></td><td class='collapsing'></td></tr>";
                });

                cb(strJoint);
            },
            parties: function() {
                base.common.getData(base.api.parties, {}, false, function(parties) {
                    var firstParties, secondParties;
                    var strTemp = "<option value=''>请选择</option>";
                    var strFirstParties = strTemp, strSecondParties = strTemp, i = 0, j = 0;

                    if(parties.status) {
                        firstParties = parties.data.firstParties;
                        secondParties = parties.data.secondParties;

                        for(; i < firstParties.length; i++) {
                            strFirstParties += "<option value='" + firstParties[i].id + "'>" + firstParties[i].first_party_name + "</option>";
                        }

                        for(; j < secondParties.length; j++) {
                            strSecondParties += "<option value='" + secondParties[j].id + "'>" + secondParties[j].second_party_name + "</option>";
                        }

                        $("#nFirstPartyDropdown").html(strFirstParties);
                        $("#nSecondPartyDropdown").html(strSecondParties);

                        // 设置初始值,用于合同修改
                        setTimeout(function() {
                            $("#nFirstPartyDropdown").dropdown("set selected", $("#nFirstPartyDropdown").attr("data-origin-name"));
                            $("#nSecondPartyDropdown").dropdown("set selected", $("#nSecondPartyDropdown").attr("data-origin-name"));
                            $("#nContractTypeDropdown").dropdown("set selected", $("#nContractTypeDropdown").attr("data-origin-name"));
                        }, 0);
                    }
                });
            },
            modalMsg: function(msg, selectorName) {       /** 控制弹出层的提示信息的显示与隐藏 **/
                var _msg = msg || "";

                $("#" + selectorName).find("span").html(_msg);

                if(_msg === "") {
                    $("#" + selectorName).removeClass("hidden").transition("fade");
                }else {
                    $("#" + selectorName).closest(".hidden").transition("fade");
                }
            }
        }

        var validate = {
            contractNumber: function(contractNumber) {
                if(contractNumber === "")
                    return {status: false, message: "请输入完整的合同编号"};
                else
                    return {status: true};
            },
            firstPartyId: function(firstPartyId) {
                if(firstPartyId === "")
                    return {status: false, message: "请选择甲方"};
                else
                    return {status: true};
            },
            secondPartyId: function(secondPartyId) {
                if(secondPartyId === "")
                    return {status: false, message: "请选择乙方"};
                else
                    return {status: true};
            },
            contractType: function(contractType) {
                if(contractType === "")
                    return {status: false, message: "请选择合同类型"};
                else
                    return {status: true};
            },
            contractTime: function(effectiveTime, endTime) {
                var _effectiveTime = new Date(effectiveTime).getTime();
                var _endTime = new Date(endTime).getTime();

                if(_effectiveTime.toString() === "NaN" || _endTime.toString() === "NaN")
                    return {status: false, message: "请选择合同生效截止日期"};
                else if(_effectiveTime > _endTime) {
                    return {status: false, message: "合同生效日期应小于截止日期"};
                }else {
                    return {status: true};
                }
            },
            contractPrice: function(contractPrice) {
                if(contractPrice === "" || contractPrice.toString().match(/^\d+(\.\d+)?$/g) === null)
                    return {status: false, message: "请输入正确的合同金额"};
                else
                    return {status: true};
            },
            deposit: function(deposit) {
                if(deposit === "" || deposit.toString().match(/^\d+(\.\d+)?$/g) === null)
                    return {status: false, message: "请输入正确的保证金金额"};
                else
                    return {status: true};
            }
        }

		$("#effectiveTime, #endTime, #nEffectiveTime, #nEndTime").datepicker({
			showButtonPanel: true,
			dateFormat: "yy-mm-dd"
		});

        /**
         * 打开修改合同窗口
         */
        $("#modifyBtn").on("click", function() {
            $("#contractModal").modal("setting", "transition", "fade down").modal("show");
        });

        /**
         * 修改合同
         */
        $("#confirmContractBtn").on("click", function() {
            var errMsg = "";
            var arrValidateItem = [];
            var params = {
                contractNumber: $("#nContractNumber").val(),
                firstPartyId: $("#nFirstPartyDropdown option:selected").val(),
                secondPartyId: $("#nSecondPartyDropdown option:selected").val(),
                contractType: $("#nContractTypeDropdown option:selected").val(),
                effectiveTime: $("#nEffectiveTime").val(),
                endTime: $("#nEndTime").val(),
                contractPrice: $("#nPrice").val(),
                deposit: $("#nDeposit").val()
            };

            arrValidateItem.push(validate.contractNumber(params.contractNumber));
            arrValidateItem.push(validate.firstPartyId(params.firstPartyId));
            arrValidateItem.push(validate.secondPartyId(params.secondPartyId));
            arrValidateItem.push(validate.contractType(params.contractType));
            arrValidateItem.push(validate.contractTime(params.effectiveTime, params.endTime));
            arrValidateItem.push(validate.contractPrice(params.contractPrice));
            arrValidateItem.push(validate.deposit(params.deposit));

            for(var i in arrValidateItem){
                if(arrValidateItem[i].status === false) {
                    errMsg = arrValidateItem[i].message;
                    break;
                }
            }

            if(errMsg === "") {
                $("#listLoader").addClass("active");
                base.common.postData(base.api.modifyContract, params, false, function(ret) {
                    if(ret.status) {
                        render.modifyDetail(ret.data.list, function(str) {
                            $("#contractDetailTab tbody").html(str);
                            $('#contractModal').modal("setting", "transition", "fade down").modal("hide");
                        });
                    }else {
                        render.modalMsg(ret.message, "contractModalMsg");
                    }

                    $("#listLoader").removeClass("active");
                }, function() {});
            }else {
                render.modalMsg(errMsg, "contractModalMsg");
            }
        });

        /**
         * 选择大区
         */
        $("#regionDropdown").change(function() {
            var params = {
                region_id: $(this).val()
            }

            $('#provinceDropdown').dropdown('set text', "请选择省");
            $('#cityDropdown').dropdown('set text', "请选择市");

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

            $('#cityDropdown').dropdown('set text', "请选择市");

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
        $('#contractModal').modal("setting", "onHide", function() {
            render.modalMsg(null, "contractModalMsg");
        });

        render.parties();
	});
});