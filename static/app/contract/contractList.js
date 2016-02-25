define(["jquery", "jquery-ui", "base", "transition", "dimmer", "modal", "popup"], function($, ui, base) {
	$(function() {
        var render = {
            contractList: function(list, cb) {
                var i = 0, strJoin = "", contractStatus = "";

                if(list) {
                    for(; i < list.length; i++) {
                        switch (list[i].contract_status) {
                            case 0:
                                contractStatus = "待生效";
                                break;
                            case 1:
                                contractStatus = "执行中";
                                break;
                            case 2:
                                contractStatus = "完成";
                                break;
                            case 3:
                                contractStatus = "逾期";
                                break;
                        }

                        strJoin += "<tr class='ui center aligned segment'>"
                                 + "<td>" + list[i].contract_number + "</td>"
                                 + "<td>" + list[i].first_party_name + "</td>"
                                 + "<td>" + list[i].region_name + "-" + list[i].province_name + "-" + list[i].city_name + "</td>"
                                 + "<td>" + list[i].second_party_name + "</td>"
                                 + "<td>" + list[i].contract_type_name + "</td>"
                                 + "<td>" + list[i].effective_time + "</td>"
                                 + "<td>" + list[i].end_time + "</td>"
                                 + "<td>" + list[i].contract_price + "</td>"
                                 + "<td>" + list[i].deposit + "</td>"
                                 + "<td>" + parseInt(list[i].contract_price + list[i].deposit) + "</td>"
                                 + "<td>" + list[i].paid_price + "</td>"
                                 + "<td>" + (list[i].invoice_count || 0) + "</td>"
                                 + "<td>" + (list[i].invoice_price || 0) + "</td>"
                                 + "<td>" + list[i].saler_name + "</td>"
                                 + "<td>" + contractStatus + "</td>"
                                 + "<td>" + (list[i].overdue_days > -1 ? list[i].overdue_days : "--") + "</td>"
                                 + "<td>" + (list[i].create_time || "--") + "</td>"
                                 + "<td><a href='/contract/detail/" + list[i].contract_number + "'><button data-id='" + list[i].contract_number + "' class='ui primary aligned button'>详情</button></a></td></tr>";
                    }
                }

                cb(strJoin);
            },
            footerPagination: function(paganition, cb) {
                var strJoin = "", className;

                strJoin = "<a data-disable='" + paganition.isFirst + "' data-type='prev' data-curr='" + paganition.pageNo + "' class='icon item'>"
                        + "<i class='left chevron icon'></i></a>";

                paganition.count.forEach(function(index) {
                    if(paganition.pageNo == index)
                        className = "active";
                    else
                        className = "";

                    strJoin += "<a class='item " + className + "'>" + index + "</a>";
                });

                strJoin += "<a data-disable='" + paganition.isLast + "' data-type='next' data-curr='" + paganition.pageNo + "' class='icon item'>"
                         + "<i class='right chevron icon'></i></a>";

                cb(strJoin);
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
                    }
                });
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
         * 条件查询
         */
		$("#queryBtn").on("click", function(evt, isPagination, that) {
            var isPagination = isPagination || null;
            var $that = $(that) || $(this);
            var currPageNo = null;
			var params = {
				contract_number: $("#contractNumber").val(),
				first_party_name: $("#firstPartyName").val(),
				second_party_name: $("#secondPartyName").val(),
				effective_time: $("#effectiveTime").val(),
				end_time: $("#endTime").val(),
				saler_name: $("#salerName").val(),
				contract_status: $("#contractStatus").val(),
				contract_type: $("#contractType").val(),
				region_id: $("#regionDropdown").val(),
				province_id: $("#provinceDropdown").val(),
				city_id: $("#cityDropdown").val()
			}

            if(isPagination) {
                currPageNo = parseInt($that.parent().find("a").eq(0).attr("data-curr")) || 1;
                if($that.attr("data-type") === "prev") {
                    if($that.attr("data-disable") === "false")
                        params.pageNo = currPageNo - 1;
                    else
                        return false;
                }else if($that.attr("data-type") === "next") {
                    if($that.attr("data-disable") === "false")
                        params.pageNo = currPageNo + 1;
                    else
                        return false;
                }else {
                    var _no = parseInt($that.html());

                    if(currPageNo !== _no)
                        params.pageNo = _no;
                    else
                        return false;
                }
            }

			$("#listLoader").addClass("active");
			base.common.getData(base.api.contractList, params, false, function(resultData) {
                render.contractList(resultData.list, function(str) {
                    $("#contractList").html(str);
                });

                render.footerPagination(resultData.pagination, function(str) {
                    $("#paginationBtn").html(str);
                });

                $("#listLoader").removeClass("active");
			}, function(err) {})
		});

        /**
         * 翻页
         */
        $("#paginationBtn").on("click", "a", function() {
            $("#queryBtn").trigger("click", [true, this]);
        });

        /**
         * 打开新建合同窗口
         */
        $("#createBtn").on("click", function() {
            $("#contractModal").modal("setting", "transition", "fade down").modal("show");
        });

        /**
         * 新建合同
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
            arrValidateItem.push(validate.contractNumber(params.contractNumber));
            arrValidateItem.push(validate.deposit(params.deposit));

            for(var i in arrValidateItem){
                if(arrValidateItem[i].status === false) {
                    errMsg = arrValidateItem[i].message;
                    break;
                }
            }

            if(errMsg === "") {
                $("#listLoader").addClass("active");
                base.common.postData(base.api.addContract, params, false, function(ret) {
                    if(ret.status) {
                        render.contractList(ret.data.list, function(str) {
                            $("#contractList").prepend(str);
                            $('#contractModal').modal("setting", "transition", "fade down").modal("hide");
                        });
                    }else {
                        render.modalMsg(ret.message);
                    }

                    $("#listLoader").removeClass("active");
                }, function() {});
            }else {
                render.modalMsg(errMsg);
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
            render.modalMsg();
        });

        render.parties();
	});
});