function shuffle(o) {
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

var Lottery = {

    currentMemberOrder : -1,

    currentLotteryOrder : 0,

    memberLs : [],

    lotteryData : [],

    lotteryTimeInterval : 100,

    settingData: {lotteryData: [
        {name: "三等奖", predefinedNum: 10, memb: []},
        {name: "二等奖", predefinedNum: 5, memb: []},
        {name: "一等奖", predefinedNum: 3, memb: []}
    ],
        members: ["李晓莉", "童剑", "冯雨","高婷", "卞雅萍", "李田一",
            "杜颖", "牛洋", "刘雷", "高禹", "付强",
            "严宾", "袁帅帅", "李栋栋", "耿晋普", "刘华洋",
            "冯高飞", "闫永红", "周宇", "孙俊", "曹盛",
            "刘嗣颉", "张发官", "熊震霏", "王彬彬", "陈江南", "吉思静",
            "张鑫", "陈龙", "刘明玥", "汪沁", "宋瑶", "储韩菲", "桂冠"]
    },

    initialLotteryData : function() {
//        $.ajax({
//            type : "get",
//            url : "http://al-wuhc2.github.io/raiyee.lottery.data.github.com/lottery.js",
//            cache : false, //默认值true
//            dataType : "jsonp",
//            jsonpCallback : "lottery_data",
//            error : function() { alert("数据请求失败"); },
//            success : function(data) {
        var data = Lottery.settingData;
        Lottery.memberLs = data.members || [];
        Lottery.lotteryData = data.lotteryData || [];
        $.each(Lottery.lotteryData, function(index, item) {
            Lottery.memberLs = $.merge(Lottery.memberLs, item.memb || []);
            item.luckyDogs = [];
        });
        Lottery.resortItems();


//            }
//        });
    },


    completeLottery: function () {
        window.sessionStorage.currentState = 'complete';

        var msg = "";

        $.each(Lottery.lotteryData, function(index, item) {
            var lotteryName = item.name; // 奖项名称
            msg += lotteryName + "(" + item.luckyDogs.length + "人):<p>" + item.luckyDogs.join('&nbsp;') + "<p>";
        });

        Lottery.showMultiLinesMessage(msg, 40);
        $('.helpdiv').hide();
    },

    initialItem: function() {
        if (this.isComplete()) {
            this.completeLottery();
            return;
        }

        var itemOrder = Lottery.currentLotteryOrder;
        var item = Lottery.lotteryData[itemOrder];
        var lotteryName = item.name; // 奖项名称

        Lottery.showMessage(lotteryName + "&nbsp;" + item.predefinedNum +  "名");
    },

    resortItems : function() {
        var width = document.body.offsetWidth;
        var height = document.body.offsetHeight;
        $("#lotteryPage").css({width : width + "px", height : height + "px"});

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
            lotteryContent += "<div class='lotteryItem' style='position:absolute;left:"
                + (widthGridSize*currX+Math.sin(radius)*offsetSize-itemSize/2) + "px;top:"
                + (heightGridSize*currY+Math.cos(radius)*offsetSize-itemSize/2) + "px;'>"
                + "<div style='position:relative;'><img src='images/normal.png' width='"
                + itemSize + "px' height='" + itemSize + "px'/>"
                + "<label style='top:-" +itemSize/4. + "px;left:-" +itemSize/4. + "px;width:" + itemSize*1.5 + "px;height:" + itemSize*1.5
                + "px;line-height:" + itemSize*1.5 + "px;display:none;background:url(images/highlighted.png);background-size:contain;'>"
                + item + "</label></div></div>";
            ++currX;
            if (currX > gridCount) { currX = 1; ++currY; }
        });
        $("#lotteryPage").html(lotteryContent);
    },

    showMessage : function(message) {
        $(".thickdiv").css({width : document.body.offsetWidth + "px",
            height : document.body.offsetHeight + "px",
            "line-height" : document.body.offsetHeight + "px",
            "font-size": "120px"});
        $(".thickdiv").html(message);
        $(".thickdiv").show();
        $(".helpdiv").show();
    },

    showMultiLinesMessage : function(message, fontSize) {
        $(".thickdiv").css({width : document.body.offsetWidth + "px",
            height : document.body.offsetHeight + "px",
            "line-height" :"",
            "font-size": (fontSize || 100 ) + "px"});
        $(".thickdiv").html(message);
        $(".thickdiv").show();
        $(".helpdiv").show();
    },

    hideMessage : function() {
        $(".thickdiv").hide();
        $(".helpdiv").hide();
    },

    isComplete: function () {
        return Lottery.memberLs.length <= 0 || Lottery.currentLotteryOrder >= Lottery.lotteryData.length;
    },

    startLottery : function() {
        if (this.isComplete()) {
            this.completeLottery();
            return;
        }

        window.sessionStorage.currentState = "lottery";
        Lottery.doLottery();
        Lottery.hideMessage();
    },

    itemSummary: function() {
        var itemOrder = Lottery.currentLotteryOrder;
        var item = Lottery.lotteryData[itemOrder];
        var lotteryName = item.name; // 奖项名称
        Lottery.showMultiLinesMessage(
                lotteryName + "中奖者(" + item.luckyDogs.length + "):<p>" + item.luckyDogs.join('&nbsp;'));
    },

    doLottery : function() {
        Lottery.nextRandomOrder();
        if (window.sessionStorage.currentState == "standby") {
            var itemOrder = Lottery.currentLotteryOrder;
            var item = Lottery.lotteryData[itemOrder];
            var lotteryName = item.name; // 奖项名称
            var luckyDog = Lottery.currentLotteryMember(); // 中奖人姓名

            Lottery.showMessage(lotteryName + "(" + (item.luckyDogs.length + 1) + "/" + item.predefinedNum +  ")：" + luckyDog); // 中奖显示  三等奖：XXX
        } else {
            setTimeout("Lottery.doLottery()", 50000./Lottery.lotteryTimeInterval);

            if (window.sessionStorage.currentState == "lottery") {
                Lottery.lotteryTimeInterval = Math.min(Lottery.lotteryTimeInterval + 100, 500);
            } else if (window.sessionStorage.currentState == "shutting") {
                if (Lottery.lotteryTimeInterval == 100) window.sessionStorage.currentState = "standby";
                Lottery.lotteryTimeInterval = Math.max(Lottery.lotteryTimeInterval - 100, 100);
            }
        }
    },

    nextRandomOrder : function() {
        var memberCount = Lottery.memberLs.length;
        // at least increase 1
        var increase = parseInt(Math.random() * (memberCount - 1)) + 1;
        Lottery.currentMemberOrder = (Lottery.currentMemberOrder + increase) % memberCount;
        if (window.sessionStorage.currentState == "standby" && Lottery.currentLotteryMemberList().length > 0) {
            while ($.inArray(Lottery.memberLs[Lottery.currentMemberOrder], Lottery.currentLotteryMemberList()) == -1) {
                Lottery.currentMemberOrder = (Lottery.currentMemberOrder + 1) % memberCount;
            }
        }
        $(".lotteryItem").css("z-index", "auto").find("label").hide();
        $(".lotteryItem").eq(Lottery.currentMemberOrder).css("z-index", "5").find("label").show();
    },

    currentLotteryMember : function() {
        return $(".lotteryItem").eq(Lottery.currentMemberOrder).find("label").text();
    },

    stopLottery : function() {
        window.sessionStorage.currentState = "shutting";
    },

    confirmLottery : function() {
        var itemOrder = Lottery.currentLotteryOrder;
        var item = Lottery.lotteryData[itemOrder];
        var luckyDog = Lottery.currentLotteryMember(); // 中奖人姓名
        item.luckyDogs.push(luckyDog);

        Lottery.memberLs.splice($.inArray(luckyDog, Lottery.memberLs), 1);
        Lottery.currentLotteryMemberList().splice($.inArray(luckyDog, Lottery.currentLotteryMemberList()), 1);
        Lottery.resortItems();
    },

    currentLotteryMemberList : function() {
        return Lottery.lotteryData[Lottery.currentLotteryOrder].memb || [];
    }

};

window.sessionStorage.currentState = "initial";

$(document).ready(function() {
    Lottery.initialLotteryData();
    Lottery.initialItem();
});

$(document).keyup(function(e) {
    switch(e.which){
        case 32: // space
            if (window.sessionStorage.currentState == "prepareItem") {
                Lottery.initialItem();
                window.sessionStorage.currentState = "initial";
            } else if (window.sessionStorage.currentState == "initial") {
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
                Lottery.confirmLottery();
                Lottery.itemSummary();

                Lottery.currentLotteryOrder += 1;
                window.sessionStorage.currentState = "prepareItem";
//            Lottery.initialItem();
//            Lottery.startLottery();
            }
            break;
        case 8: // back space
            if (window.sessionStorage.currentState == "standby") {
                Lottery.startLottery();
            }
            break;
    }
});
