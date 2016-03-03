define(["jquery", "jquery-ui", "base", "transition", "dimmer", "modal", "popup"], function($, ui, base) {
	$(function() {
        var render = {
            invoiceList: function(list, cb) {
                var i = 0, strJoin = "";

                if(list) {
                    for(; i < list.length; i++) {
                        strJoin += "<tr class='ui center aligned segment'>"
                                 + "<td>" + list[i].invoice_number + "</td>"
                                 + "<td>" + list[i].invoice_price + "</td>"
                                 + "<td>" + (list[i].invoice_time || '-' ) + "</td>"
                                 + "<td>" + list[i].contract_number + "</td>"
                                 + "<td>" + list[i].first_party_name  + "</td>"
                                 + "<td>" + list[i].region_name + "--" + list[i].province_name + "-" + list[i].city_name + "</td>"
                                 + "<td>" + list[i].second_party_name + "</td>"
                                 + "<td>" + list[i].contract_type_name + "</td>"
                                 + "<td>" + list[i].effective_time + "</td>"
                                 + "<td>" + list[i].end_time + "</td>"
                                 + "<td>" + list[i].contract_price + "</td>"
                                 + "<td>" + list[i].deposit + "</td>"
                                 + "<td>" + parseInt(parseInt(list[i].contract_price) + parseInt(list[i].deposit)) + "</td>"
                                 + "<td>" + list[i].saler_name + "</td>"
                                 + "<td>" + (list[i].create_time || "--") + "</td>"
                                 + "</tr>";
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

		$("#effectiveTime, #endTime, #invoiceStartTime, #invoiceEndTime, #createStartTime, #createEndTime").datepicker({
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
				contract_type: $("#contractType").val(),
				invoice_number: $("#invoiceNumber").val(),
				invoice_start_time: $("#invoiceStartTime").val(),
                invoice_end_time: $("#invoiceEndTime").val(),
                create_start_time: $("#createStartTime").val(),
                create_end_time: $("#createEndTime").val()
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
			base.common.getData(base.api.invoiceList, params, false, function(resultData) {
                render.invoiceList(resultData.list, function(str) {
                    $("#invoiceList").html(str);
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
         * 监听弹出层的关闭事件
         */
        $('#contractModal').modal("setting", "onHide", function() {
            render.modalMsg();
        });
	});
});