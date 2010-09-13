var Generator = (function(){
    var ajaxAll = function(urlList, allCallBack, options){
        var loaded = 0;
        var result = [];
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
                    loaded++;
                    (typeof userCallbacks.complete === "function") && userCallbacks.complete(data, status, xhr);
                    if (loaded >= urlList.length && typeof allCallBack === "function") {
                        allCallBack.call(this, result);
                    }
                    else {
                        ajaxOne();
                    }
                },
                "success": function(data, status, xhr){
                    result.push(data);
                    (typeof userCallbacks.success === "function") && userCallbacks.success(data, status, xhr);
                }
            });
            $.ajax(options);
        }
        ajaxOne();
    };
    
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
            for (var i = 0; i < data.length; i++) {
                variable[list[i]] = data[i];
            }
            callback(data);
        }, ajaxOptions);
    };
    
    return {
        "loadTemplates": function(urls, callback){
            this.templates = this.templates || {};
            var me = this;
            fetchData(urls, function(data){
                var result = [];
                for (var i = 0; i < urls.length; i++) {
                    result.push(me.templates[urls[i]]);
                }
                callback(result);
            }, this.templates);
        },
        "loadData": function(pageVariables, callback){
            this.pageData = this.pageData || {};
            var urls = [];
            for (x in pageVariables) {
                urls.push(pageVariables[x]);
            }
            var pageData = this.pageData;
            fetchData(urls, function(data){
                var result = {};
                for (x in pageVariables) {
                    result[x] = pageData[pageVariables[x]];
                }
                callback(result);
            }, this.pageData, {
                "dataType": "jsonp"
            });
        },
        "createPage": function(options, callback){
            var me = this;
            me.loadTemplates(options.templates, function(templates){
                me.loadData(options.data, function(pageData){
                    var key = pageData;
                    for (var i = 0; i < options.key.length; i++) {
                        key = key[options.key[i]];
                    }
                    var content = $("<div>").append($.tmpl(templates.join(""), key)).html();
                    callback(content);
                });
            });
        }
    }
})();
