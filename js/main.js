$(document).ready(function(){

    $.extend({
        "urlHelper": {
            setLocation: function(location){
                document.location.href = [document.location.href.split(/[?#]/)[0], location].join("#");
            },
            getLocation: function(){
                var locationPart = document.location.href.split(/[?#]/);
                return locationPart[1] ? locationPart[1].split(/[\/.]/)[0] : null;
            },
            getArgs: function(){
                var locationPart = document.location.href.split(/[?#]/);
                return locationPart[1] ? locationPart[1].split(/[\/]/).slice(1) : null;
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
        
        $("#navigation-bar a").click(function(event){
            $("#navigation-bar a").removeClass("navigation-bar-active");
            $(this).addClass("navigation-bar-active");
        });
        
        $(target).find(".inline-load").bind("click", function(){
            var cur = $(this);
            $("#" + cur.attr("target")).html("Loading");
            var baseLocation = document.location.href.split(/[?#]/)[0];
            var lastLocation = baseLocation.lastIndexOf("/");
            if (lastLocation != -1) {
                baesLocation = baseLocation.substring(0, lastLocation);
            }
            $.urlHelper.setLocation(cur.attr("href").replace(baseLocation, ""));
            
            $("#" + cur.attr("target")).load(cur.attr("href"), null, function(responseText, status){
                if (status === "success") {
                    me.initializeLinks("#" + cur.attr("target"));
                    me.onloadModule();
                }
                else {
                    $("#" + cur.attr("target")).load("notfound.html", null, function(){
                        me.onloadModule(false);
                    });
                }
            });
            return false;
        });
    },
    
    onloadModule: function(flag){
        var moduleName = $.urlHelper.getLocation();
        if (this.onLoadHandler[moduleName] && typeof(this.onLoadHandler[moduleName]) === "function") {
            this.onLoadHandler[moduleName].call(this, flag);
        }
        else {
            this.onLoadHandler["homePage"].call(this, flag);
        }
    },
    
    onLoadHandler: {
        "projects": function(flag){
            var args = $.urlHelper.getArgs();
            if (args && args.length == 0) {
                $(".project-list").removeClass("project-list-single");
            }
            else {
                $(".project-list").addClass("project-list-single");
                $(".project").css("background-image", "url('" + $(".project-image").attr("src") + "')");
                $(".project-links a").attr("target", "_blank");
            }
        },
        "homePage": function(flag){
            var me = this;
            $("#README").load("README");
            $("#otherProjects").load("projects.html", function(){
                $(".project-item").css("width", "90%");
                var projectsToShow = 4;
                $(".project-item").hide();
                $(".project-item").each(function(){
                    if (projectsToShow === 0) {
                        return;
                    }
                    if (Math.floor(Math.random() * 10 % 2)) {
                        projectsToShow--;
                        $(this).show();
                    }
                });
                $(".project-item").click(function(){
                    $.urlHelper.setLocation($(this).attr("href"));
                    me.loadModule();
                    return false;
                });
            });
            
            $("#seeAllProjects").click(function(){
                $("#projects").click();
            });
        }
    },
    
    loadModule: function(){
        var moduleName = $.urlHelper.getLocation();
        var args = $.urlHelper.getArgs();
        if (!this.loadModuleHandler[moduleName] || !typeof(this.loadModuleHandler[moduleName]) === "function") {
            moduleName = "homePage";
        }
        $("#navigation-bar a[href=" + moduleName + ".html]").click();
        this.loadModuleHandler[moduleName].call(this, args);
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
        "homePage": function(){
        },
        "misc": function(){
        
        }
    }
};
