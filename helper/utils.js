var http = require("http");
var extend = require("extend");
var _ = require("underscore");

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


/**
 * 过滤查询字段,返回联表或orm查询所需的拼接字符串.
 * @param origin 用户传入的基本条件字段及参数
 * @param basic 基准数据,用于数据过滤,数据格式为Object.
 * @param cb {strCondition, arrArgs}, strCondition: 用于orm查询的条件拼接字符串, value: 参数数组.
 *
 * 补充说明:
 * basic {key: value}, key: 表示字段名称, value: String || Object.
 * 若数据类型为String时表示关联表的缩写前缀,如果为空不表不需要表关联前缀.
 * 若数据类型为KV形式Object时,prefix为表关联前缀标示,keyword为运算符.
 *
 * 例子:
 * var origin = {
 *     name: robin,
 *     age: 30,
 *     score: 80
 * }
 *
 * basic = {
 *     name: {keyword: "like", prefix: "user", sign: ["%", "%"]},
 *     age: "user",
 *     score: {keyword: "<", prefix: "class"}
 * }
 *
 * 返回值:
 * strCondition: name like ? and user.age>? and class.score < ?
 * arrVal: ["robin", 30, 80]
 */
exports.ormFilter = function(origin, basic, cb) {
    var prefix, i, j, arrCondition = [], arrArgs = [], strL, strR;
    var keywords = [">", "<", "<>", "in", "not in", "like"];


    for (i in basic) {
        for (j in origin) {
            if (typeof basic === "object" && Object.prototype.toString.call(basic).toLowerCase() === "[object object]" && !basic.length) {
                if(j === i) {
                    strL = "", strR = "";

                    // 拼装查询字段名称
                    if(typeof basic[i] === "string") {
                        prefix = basic[i] ? (basic[i] + "." + i) : i;
                    }else {
                        if(basic[i].mapsTo) {
                            prefix =  basic[i].prefix ? (basic[i].prefix + "." + basic[i].mapsTo) : basic[i].mapsTo;
                        }else {
                            prefix =  basic[i].prefix ? (basic[i].prefix + "." + i) : i;
                        }
                    }

                    // 拼装orm查询需要的字段值的通配符
                    if(basic[i].sign) {
                        if(basic[i].sign instanceof Array) {
                            strL =  basic[i].sign[0] || "";
                            strR = basic[i].sign[1] || "";
                        }else if(typeof basic[i].sign === "string") {
                            strL = basic[i].sign;
                        }
                    }

                    // 验证value的keyword属性值是否在存在于keywords.
                    if(_.indexOf(keywords, basic[i].keyword) > -1) {
                        arrCondition.push(prefix + " " + basic[i].keyword + " ?");
                    }else {
                        arrCondition.push(prefix + " = ?");
                    }

                    arrArgs.push(strL + origin[j] + strR);
                }
            }
        }
    }

    return cb(arrCondition.join(" and "), arrArgs);
}

exports.paramsFilter = function(arrBasic, params) {
    var outputParams = {};

    for(var name in arrBasic) {
        if(params[name] !== undefined) {
            outputParams[name] = params[name];
        }
    }

    return outputParams;
}

exports.paginationMath = function(pageNo, count) {
    var curPageNo = parseInt(pageNo);
    var totalPageNo = parseInt(count);
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
            var arrNumeric = (intPaginationSize / 2).toString().split(".");
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