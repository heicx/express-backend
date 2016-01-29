var http = require("http");
var extend = require("extend");

var ex_options = {
	hostname: "api.new.ssiautos.cn", 
	port: 81,
	method: "POST",
    path: "",
    headers: {
        "Content-Type": "application/x-www-form-urlencoded"
    }
}

exports.sendRequest = function (data, options, callback) {
	var req;

	options = extend(true, ex_options, options);
	req = http.request(options, callback);

    req.on("error", function(e) {
        req.write("problem with request: " + e.message).end();
    });

    req.write(data);
	req.end();
}

exports.arrToJSON = function(arr) {
    var obj = {};

    if(arr instanceof Array && arr.length > 0) {
        var i = 0;

        for(; i<arr.length; i++) {
            obj[i] = arr[i];
        }
    }

    return obj;
}

exports.isPosiInterger = function(str) {
    return (parseInt(str) == str);
}

exports.paginationMath = function(curPageNo, totalPageNo) {
    var oPagination = {
        isFirst: curPageNo == 1 ? true : false,
        isLast: curPageNo == totalPageNo ? true : false
    };
    var arrTemp = [];
    var i = 1;
    var intPaginationSize = 5;
    var intPageNo = curPageNo <= 0 ? 1 : curPageNo;

    if(totalPageNo <= intPaginationSize || intPageNo > totalPageNo) {
        totalPageNo = totalPageNo > intPaginationSize ? intPaginationSize : (totalPageNo <= 0 ? 1 : totalPageNo);

        for(; i <= totalPageNo; i++) {
            arrTemp.push(i);
        }

        oPagination.count = arrTemp;
        oPagination.pageNo = (intPageNo > intPaginationSize || intPageNo > totalPageNo) ? 1 : intPageNo;
    }else {
        if(intPageNo > (totalPageNo - intPaginationSize)) {
            for(; i <= intPaginationSize; i++) {
                arrTemp.unshift(totalPageNo--);
            }

            oPagination.count = arrTemp;
            oPagination.pageNo = intPageNo;
        }else {
            var arrNumeric = (intPaginationSize/2).toString().split(".");
            var booDecimals = arrNumeric.length == 2 ? true : false;
            var intPageNoRemained = parseInt((intPaginationSize/2).toString().split(".")[0]) + (booDecimals ? 1 : 0) || 1;
            var intTempPageNo = intPageNo;
            var intRemained;

            for(; i<= intPageNoRemained; i++) {
                if(intTempPageNo > 0)
                    arrTemp.unshift(intTempPageNo--);
                else
                    break;
            }

            intRemained = intPaginationSize - arrTemp.length;
            for(var j = 1; j <= intRemained; j++) {
                arrTemp.push(arrTemp[arrTemp.length-1] + 1);
            }

            oPagination.count = arrTemp;
            oPagination.pageNo = intPageNo;
        }
    }

    return oPagination;
}