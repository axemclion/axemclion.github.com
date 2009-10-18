$(document).ready(function(){

    $.extend({
        "urlHelper": {
            setLocation: function(location){
                document.location = [document.location.href.split(/[?#]/)[0], location].join("#");
            },
            getLocation: function(){
            	var locationPart = document.location.href.split(/[?#]/);
                return locationPart[1] ? locationPart[1].split(/[\/.]/)[0] : null;
            },
            getArgs: function(){
            	var locationPart = document.location.href.split(/[?#]/);
                return  locationPart[1] ? locationPart[1].split(/[\/]/).slice(1) : null;
            }
        }
    });
    if (top.location != window.location) {
        top.location = window.location;
    }
    Page.init();
});

var Page = {
    init: function(){
        this.initializeLinks();
        this.loadModule();
    },
    
    initializeLinks: function(target){
        var me = this;
        if (!target) {
            target = document.body;
        }
        
        $(target).find(".inline-load").click(function(){
            var cur = $(this);
            $("#" + cur.attr("target")).html("Loading");
            $("#" + cur.attr("target")).load(cur.attr("href"), null, function(responseText, status){
                if (status === "success") {
                    $.urlHelper.setLocation(cur.attr("href"));
                    me.initializeLinks("#" + cur.attr("target"));
                    me.onloadModule();
                }
                else {
                    $("#" + cur.attr("target")).load("notfound.html");
                }
            });
            return false;
        });
    },
    
    onloadModule: function(){
        var moduleName = $.urlHelper.getLocation();
        if (this.onLoadHandler[moduleName] && typeof(this.onLoadHandler[moduleName]) === "function") {
            this.onLoadHandler[moduleName].call(this);
        }
    },
    
    onLoadHandler: {
        "projects": function(){
            var args = $.urlHelper.getArgs();
            if (args && args.length == 0) {
                $(".project-list").removeClass("project-list-single");
            }
            else {
                $(".project-list").addClass("project-list-single");
            }
        }
    },
    
    loadModule: function(){
        var moduleName = $.urlHelper.getLocation();
        var args = $.urlHelper.getArgs();
        $("#navigation-bar a[href=" + moduleName + ".html]").click();
        if (this.loadModuleHandler[moduleName] && typeof(this.loadModuleHandler[moduleName]) === "function") {
            this.loadModuleHandler[moduleName].call(this, args);
        }
    },
    
    loadModuleHandler: {
        "projects": function(args){
            if (args && args.length > 0) {
                var interval = window.setInterval(function(){
                    if ($(".project-list").length > 0) {
                        window.clearInterval(interval);
                        $(".project-list .project-item[href=projects/" + args[0] + "]").click();
                    }
                }, 500);
            }
        },
    }
};
