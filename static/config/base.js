define(["jquery"], function($) {
    var config = {
        host: "http://" + window.location.host,
        address: {
            contractList: "/contract/list?method=search",
            addContract: "/contract/add",
            modifyContract: "/contract/modify",
            removeContract: "/contract/remove",
            verifyContract: "/contract/verify",
            parties: "/contract/parties",
            paymentList: "/payment/list",
            allArea: "/dictionary/region/list",
            addRegion: "/dictionary/region/add",
            editRegion: "/dictionary/region/edit",
            queryFirstParty: "/dictionary/firstParty/list",
            querySecondParty: "/dictionary/secondParty/list",
            addFirstParty: "/dictionary/firstParty/add",
            addSecondParty: "/dictionary/secondParty/add",
            queryContractType: "/dictionary/contractType/list",
            addContractType: "/dictionary/contractType/add",
            queryContractBank: "/dictionary/contractBank/list",
            addContractBank: "/dictionary/contractBank/add",
            getProvince: "/area/province",
            getCity: "/area/city",
            userList: "/user/list",
            addUser: "/user/add",
            invoiceList: "/invoice/list",
            addInvoice: "/invoice/add",
            addPayment: "/payment/add",
            removeContract: "/contract/remove"
        }
    }

    var common = {
        getData: function(api, params, async, successCallback, errorCallback) {
            try{
                var strTemp = "";
                var arrTemp = [];

                if(params) {
                    for(var i in params) {
                        if(params[i] === "")
                            continue;
                        else {
                            arrTemp.push(i + "=" + params[i])
                        }
                    }

                    strTemp = arrTemp.join("&");
                }

                if(api.indexOf("?") > -1) {
                    strTemp = "&async=true&" + strTemp;
                }else {
                    strTemp = "?async=true&" + strTemp;
                }

                $.ajax({
                    cache: false,
                    type: "GET",
                    async: async,
                    url: config.host + api + strTemp,
                    dataType: "json",
                    success: function(returnData) {
                        successCallback(returnData);
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        errorCallback(errorThrown);
                    }
                })
            }catch(err) {
                throw Error("get方式调用接口时出现未知错误");
            }
        },
        postData: function(api, params, async, successCallback, errorCallback) {
            try{
                var __url = config.host + api;

                params.async = true;
                $.ajax({
                    cache: false,
                    type: "POST",
                    async: async,
                    url: __url,
                    dataType: "json",
                    data: params,
                    success: function(returnData) {
                        successCallback(returnData);
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        errorCallback(errorThrown);
                    }
                });
            }catch(err) {
                throw Error("post方式调用接口时出现未知错误");
            }
        }
    }

    return {
        api : config.address,
        common: common
    };
});