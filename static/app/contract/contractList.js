define(["jquery", "jquery-ui", "base"], function($, ui, base) {
	$(function() {
        var render = {
            contractList: function(res, cb) {
                var i = 0, j = 0, strJoin = "", contractStatus = "";
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
				region_id: $("#region").val(),
				privince_id: $("#privince").val(),
				city_id: $("#city").val()
			}

			$("#listLoader").addClass("active");
			base.common.getData(base.api.contractList, params, false, function(resultData) {
                render.contractList(resultData, function(str) {
                    $("#contractList").html(str);
                    $("#listLoader").removeClass("active");
                });
			}, function(err) {})
		});
	});
});