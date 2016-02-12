define(["jquery"], function($) {
    var config = {
        host: "http://" + window.location.host,
        address: {
            contractList: "/contract/list",
            allArea: "/dictionary/region/list",
            addRegion: "/dictionary/region/add",
            editRegion: "/dictionary/region/edit",
            queryFirstParty: "/dictionary/firstParty/list",
            querySecondParty: "/dictionary/secondParty/list",
            addFirstParty: "/dictionary/firstParty/add",
            addSecondParty: "/dictionary/secondParty/add",
            getProvince: "/area/province",
            getCity: "/area/city"
        }
    }

    var common = {
        getData: function(api, params, async, successCallback, errorCallback) {
            var strTemp = "", __url = "";

            if(params) {
                for(var i in params) {
                    if(params[i] === "")
                        continue;
                    else {
                        strTemp += "&" + i + "=" + params[i];
                    }
                }
            }

            __url = config.host + api + "?async=true" + strTemp;

            $.ajax({
                cache: false,
                type: "GET",
                async: async,
                url: __url,
                dataType: "json",
                success: function(returnData) {
                    successCallback(returnData);
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    errorCallback(errorThrown);
                }
            })
        },
        postData: function(api, params, async, successCallback, errorCallback) {
            var __url = config.host + api;

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
            })
        }
    }

    return {
        api : config.address,
        common: common
    };
});