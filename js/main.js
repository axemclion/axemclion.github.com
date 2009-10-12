$(document).ready(function(){

    $.extend({
        "urlHelper": {
            setLocation: function(location){
                document.location = [document.location.href.split(/[?#]/)[0], location].join("#");
            },
            getLocation: function(){
                return document.location.href.split(/[?#]/g)[1];
            },
            getArgs: function(){
                return document.location.href.split(/[?#]/g).slice(2).join("");
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
    },
    
    initializeLinks: function(target){
        var me = this;
        if (!target) {
            target = document.body;
        }
        
        $(target).find(".inline-load").click(function(){
            var cur = $(this);
            $("#" + cur.attr("target")).load(cur.attr("href"), null, function(responseText, status){
                if (status === "success") {
                    $.urlHelper.setLocation(cur.attr("name"));
                    me.initializeLinks("#" + cur.attr("target"));
                    me.onModuleLoad();
                }
                else {
                    $("#" + cur.attr("target")).load("notfound.html");
                }
            });
            return false;
        });
    },
    
    onModuleLoad: function(){
        var me = this;
        var moduleName = $.urlHelper.getLocation();
        if (this.modules[moduleName] && typeof(this.modules[moduleName]) === "function") {
            this.modules[moduleName].call(me, $.urlHelper.getArgs());
        }
    },
    
    modules: {
        "projects": function(args){
            if (args != "") {
                $(".project-description").fadeOut();
                $(".project-list").addClass(".project-list-single");
            }
            else {
                $(".project-list").removeClass(".project-list-single");
            }
        }
    }
};
