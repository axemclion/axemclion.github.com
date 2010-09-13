var Generator = (function(){
    var ajaxAll = function(urlList, allCallBack, options){
        var loaded = 0;
        var result = {};
        if (urlList.length === 0) {
            allCallBack(result);
            return;
        }
        options = options || {};
        var userCallbacks = {
            "success": options.success,
            "complete": options.complete
        }
        var ajaxOne = function(){
            $.extend(options, {
                "url": urlList[loaded],
                "complete": function(data, status, xhr){
                    (typeof userCallbacks.complete === "function") && userCallbacks.complete(data, status, xhr);
                    if (loaded >= urlList.length && typeof allCallBack === "function") {
                        allCallBack.call(this, result);
                    }
                    else {
                        ajaxOne();
                    }
                },
                "success": function(data, status, xhr){
                    result[urlList[loaded++]] = data;
                    (typeof userCallbacks.success === "function") && userCallbacks.success(data, status, xhr);
                }
            });
            $.ajax(options);
        }
        ajaxOne();
    };
    
    var templates = {};
    var fetchData = function(urls, callback, variable, ajaxOptions){
        var list = [];
        variable = variable || {};
        for (var i = 0; i < urls.length; i++) {
            if (typeof variable[urls[i]] === "undefined") {
                list.push(urls[i]);
            }
        }
        ajaxAll(list, function(data){
            var result = {};
            for (x in data) {
                variable[x] = data[x];
            }
            var result = [];
            for (var i = 0; i < urls.length; i++) {
                result[urls[i]] = variable[urls[i]];
            }
            (typeof callback === "function") && callback(result);
        }, ajaxOptions);
    };
    
    return {
        "loadTemplates": function(urls, callback){
            fetchData(urls, callback, this.templates);
        },
        "loadData": function(urls, callback){
            fetchData(urls, callback, this.values, {
                "dataType": "jsonp"
            });
        },
        "createPage": function(options, callback){
            var me = this;
            me.loadTemplates(options.templates, function(templates){
                me.loadData(options.data, function(data){
                    var result = [];
                    for (var i = 0; i < options.templates.length; i++) {
                        result.push(templates[options.templates[i]]);
                    }
                    
                    try {
                        var key = data[options.data];
                        for (var i = 0; i < options.key.length; i++) {
                            key = key[options.key[i]];
                        }
                        var content = $("<div>").append($.tmpl(result.join(""), key)).html();
                        callback(content);
                    } 
                    catch (e) {
                        console.error("Error", e);
                    }
                });
            });
        },
        "templates": {},
        "values": {}
    }
})();
