define(["jquery", "jquery-ui", "base"], function($, ui, base) {
	$(function() {
        var render = {
            contractList: function(res, cb) {
                var i = 0, strJoin = "", contractStatus = "";
                var list = res.data.list;

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
            }
        }

		$("#effectiveTime, #endTime").datepicker({
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
				privince_id: $("#provinceDropdown").val(),
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
	});
});