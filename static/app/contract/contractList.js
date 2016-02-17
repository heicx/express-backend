define(["jquery", "jquery-ui", "base", "transition", "dimmer", "modal", "popup"], function($, ui, base) {
	$(function() {
        var render = {
            contractList: function(res, cb) {
                var i = 0, strJoin = "", contractStatus = "";
                var list = res.list || res;

                if(typeof(list) === "object" && Object.prototype.toString.call(list).toLowerCase() == "[object object]") {
                    list = [list];
                }

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
                                 + "<td><button data-id='" + list[i].contract_number + "' class='ui primary aligned button'>详情</button></td></tr>";
                    }

                    cb(strJoin);
                }
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

                $("#modalMsg p").html(_msg);

                if(_msg === "") {
                    $("#modalMsg").removeClass("hidden").transition("fade");
                }else {
                    $("#modalMsg").closest(".hidden").transition("fade");
                }
            }
        }

		$("#effectiveTime, #endTime, #nEffectiveTime, #nEndTime").datepicker({
			showButtonPanel: true,
			dateFormat: "yy-mm-dd"
		});

        /**
         * 条件查询
         */
		$("#queryBtn").on("click", function() {
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

			$("#listLoader").addClass("active");
			base.common.getData(base.api.contractList, params, false, function(resultData) {
                render.contractList(resultData, function(str) {
                    $("#contractList").html(str);
                    $("#listLoader").removeClass("active");
                });
			}, function(err) {})
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

            base.common.postData(base.api.addContract, params, false, function(ret) {
                console.log(ret);
                if(ret.status) {
                    render.contractList(ret.data, function() {

                    });
                }
            }, function() {});
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

        render.parties();
	});
});