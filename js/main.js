$(document).ready(function(){

    $.extend({
        "urlHelper": {
            "navigateTo": function(location){
                document.location = [document.location.href.split(/[?#]/)[0], location].join("#");
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
    
    initializeLinks: function(){
        var me = this;
        $(".inline-load").click(function(){
            var cur = $(this);
            $("#" + cur.attr("target")).load(cur.attr("href"), null, function(responseText, status){
                if (status === "success") {
                    var func = me.sections[cur.attr("name")];
                    $.urlHelper.navigateTo(cur.attr("name"));
                    if (func && typeof(func) === "function") {
                        func.call(me);
                    }
                }
                else {
                    $("#" + cur.attr("target")).load("notfound.html");
                }
            });
            return false;
        });
    },
    
    sections: {
        projects: function(){
            this.initializeLinks();
        },
        aboutMe: function(){
        },
        aboutSite: function(){
        }
    },
};
