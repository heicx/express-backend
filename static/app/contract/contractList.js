define(["jquery", "jquery-ui", "base"], function($, ui, base) {
	$(function() {
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
				console.log(resultData);
				$("#listLoader").removeClass("active");
			}, function(err) {})
		});
	});
});