
function shuffle(o) {
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

var Lottery = {

    currentMemberOrder : -1,

    currentLotteryOrder : 0,

    memberLs : [],

    lotteryData : [],

    initialLotteryData : function() {
        $.ajax({
            type : "get",
            url : "http://al-wuhc2.github.io/raiyee.lottery.data.github.com/lottery.js",
            cache : false, //默认值true
            dataType : "jsonp",
            jsonpCallback : "lottery_data",
            error : function() { alert("数据请求失败"); },
            success : function(data) {
                Lottery.memberLs = data.members || [];
                Lottery.lotteryData = data.lotteryData;
                $.each(Lottery.lotteryData, function(index, item) {
                    Lottery.memberLs = $.merge(Lottery.memberLs, item["memb"] || []);
                });
                Lottery.resortItems();
                Lottery.showMessage("按空格键开始抽奖");
            }
        });
    },

    resortItems : function() {
        var width = document.body.offsetWidth;
        var height = document.body.offsetHeight;
        $("#lotteryPage").css("width", width + "px");
        $("#lotteryPage").css("height", height + "px");

        var memberCount = Lottery.memberLs.length;
        var gridCount = Math.ceil(Math.sqrt(memberCount));
        var widthGridSize = width / (gridCount + 1.);
        var heightGridSize = height / (gridCount + 1.);
        var itemSize = Math.max(widthGridSize, heightGridSize);
        var offsetSize = itemSize / 5.;

        shuffle(Lottery.memberLs);
        var currX = 1, currY = 1;
        var lotteryContent = "";
        $.each(Lottery.memberLs, function(index, item) {
            var radius = Math.random()*Math.PI*2;
            lotteryContent += "<div class=\"lotteryItem\" style=\"position:absolute;left:"
                            + (widthGridSize*currX+Math.sin(radius)*offsetSize-itemSize/2) + "px;top:"
                            + (heightGridSize*currY+Math.cos(radius)*offsetSize-itemSize/2) + "px;\">"
                            + "<div style=\"position:relative;\"><img src=\"images/normal.png\" width=\""
                            + itemSize + "px\" height=\"" + itemSize + "px\"/>"
                            + "<label style=\"top:-" +itemSize/4. + "px;left:-" +itemSize/4. + "px;width:" + itemSize*1.5 + "px;height:" + itemSize*1.5
                            + "px;line-height:" + itemSize*1.5 + "px;display:none;background:url(images/highlighted.png);background-size:contain;\">"
                            + item + "</label></div>"
                            + "</div>";
            ++currX;
            if (currX > gridCount) { currX = 1; ++currY; }
        });
        $("#lotteryPage").html(lotteryContent);
    },

    showMessage : function(message) {
        $(".thickdiv").css("width", document.body.offsetWidth + "px");
        $(".thickdiv").css("height", document.body.offsetHeight + "px");
        $(".thickdiv").css("line-height", document.body.offsetHeight + "px");
        $(".thickdiv").html(message);
        $(".thickdiv").show();
        $(".helpdiv").show();
    },

    hideMessage : function() {
        $(".thickdiv").hide();
        $(".helpdiv").hide();
    },

    startLottery : function() {
        if (Lottery.memberLs.length <= 0 || Lottery.currentLotteryOrder >= Lottery.lotteryData.length) {
            Lottery.showMessage("抽奖结束");
            return;
        }
        window.sessionStorage.currentState = "lottery";
        Lottery.doLottery();
        Lottery.hideMessage();
    },

    doLottery : function() {
        if (window.sessionStorage.currentState == "standby") {
            Lottery.nextRandomOrder();
            
            Lottery.showMessage("中奖者：" + Lottery.currentLotteryMember());
        } else {
            Lottery.nextRandomOrder();
            setTimeout("Lottery.doLottery()", 100);
        }
    },

    nextRandomOrder : function() {
        var memberCount = Lottery.memberLs.length;
        // at least increase 1
        var increase = parseInt(Math.random() * (memberCount - 1)) + 1;
        Lottery.currentMemberOrder = (Lottery.currentMemberOrder + increase) % memberCount;
        if (window.sessionStorage.currentState == "standby" && Lottery.lotteryData[Lottery.currentLotteryOrder]["memb"].length > 0) {
            while ($.inArray(Lottery.memberLs[Lottery.currentMemberOrder], Lottery.lotteryData[Lottery.currentLotteryOrder]["memb"]) == -1) {
                Lottery.currentMemberOrder = (Lottery.currentMemberOrder + 1) % memberCount;
            }
        }
        $(".lotteryItem").css("z-index", "auto").find("img").attr("src", "images/normal.png").next().hide();
        $(".lotteryItem:eq("+Lottery.currentMemberOrder+")").css("z-index", "5").find("img").attr("src", "images/highlighted.png").next().show();
    },

    currentLotteryMember : function() {
        return $(".lotteryItem:eq("+Lottery.currentMemberOrder+")").find("label").text();
    },

    stopLottery : function() {
        window.sessionStorage.currentState = "standby";
    },

    confirmLottery : function() {
        Lottery.memberLs.splice($.inArray(Lottery.currentLotteryMember(), Lottery.memberLs), 1);
        Lottery.lotteryData[Lottery.currentLotteryOrder]["memb"].splice($.inArray(Lottery.currentLotteryMember(), Lottery.lotteryData[Lottery.currentLotteryOrder]["memb"]), 1);
        Lottery.resortItems();
    },

};

window.sessionStorage.currentState = "initial";

$(document).ready(function() {

    Lottery.initialLotteryData();

});

$(document).keyup(function(e) {
    switch(e.which){
    case 32: // space
        if (window.sessionStorage.currentState == "initial") {
            Lottery.startLottery();
        } else if (window.sessionStorage.currentState == "standby") {
            Lottery.confirmLottery();
            Lottery.startLottery();
        } else if (window.sessionStorage.currentState == "lottery") {
            Lottery.stopLottery();
        }
        break;
    case 13: // enter
        if (window.sessionStorage.currentState == "standby") {
            Lottery.currentLotteryOrder += 1;
            Lottery.startLottery();
        }
        break;
    case 8: // back space
        if (window.sessionStorage.currentState == "standby") {
            Lottery.startLottery();
        }
        break;
    }
});
