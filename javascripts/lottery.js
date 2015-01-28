function shuffle(o) {
    for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

var Lottery = {
        currentMemberOrder: -1,
        currentLotteryOrder: 0,
        memberLs: [],
        lotteryData: [],
        lotteryTimeInterval: 100,

        settingData: {
            lotteryData: [
                {
                    name: "三等奖", // 奖项名称
                    predefinedNum: 10, // 抽奖人数
                    memb: "赵三 钱三 孙三 李三 周三 吴三 郑三 王三 杨三 朱三 秦三 尤三 许三 何三 吕三 施三 张三 姜三 戚三 谢三 邹三 喻三 柏三 水三 窦三 章三 郎三 鲁三 韦三 昌三 马三 苗三 凤三 花三 方三 唐三"
                }
                , {
                    name: "二等奖", // 奖项名称
                    predefinedNum: 5, // 抽奖人数
                    memb: "赵二 钱二 孙二 李二 周二 吴二 郑二 王二 杨二 朱二 秦二 尤二 许二 何二 吕二 施二 张二 姜二 戚二 谢二 邹二 喻二 柏二 水二 窦二 章二 郎二 鲁二 韦二 昌二 马二 苗二 凤二 花二 方二 唐二"
                }
                , {
                    name: "一等奖", // 奖项名称
                    predefinedNum: 3,// 抽奖人数
                    memb: "赵一 钱一 孙一 李一 周一 吴一 郑一 王一 杨一 朱一 秦一 尤一 许一 何一 吕一 施一 张一 姜一 戚一 谢一 邹一 喻一 柏一 水一 窦一 章一 郎一 鲁一 韦一 昌一 马一 苗一 凤一 花一 方一 唐一"
                }
                , {
                    name: "特等奖", // 奖项名称
                    predefinedNum: 2,// 抽奖人数
                    memb: "赵特 钱特 孙特 李特 周特 吴特 郑特 王特 杨特 朱特 秦特 尤特 许特 何特 吕特 施特 张特 姜特 戚特 谢特 邹特 喻特 柏特 水特 窦特 章特 郎特 鲁特 韦特 昌特 马特 苗特 凤特 花特 方特 唐特"
                }
            ]
            //, members: "曹操 曹仁 曹洪 曹纯 曹休 曹真 曹昂 曹丕  " +
            //"曹彰 曹植 陈到 陈宫 陈珪 陈登 陈琳 陈群 陈武  " +
            //"陈震 崔琰 崔林 程普 程秉 程昱 淳于琼  " +
            //"邓艾 邓芝 典韦 丁奉 丁原 董和 董袭 董昭 董卓 杜畿  " +
            //"法正 费祎 逢纪 伏完 伏德 甘宁 高干 高览 高顺 关羽  " +
            //"管宁 郭淮 郭嘉 国渊 顾雍 韩当 韩浩 韩遂 郝昭 何晏  " +
            //"华佗 华歆 皇甫嵩 黄盖 黄权 黄琬 黄忠 霍峻 贾诩 姜维  " +
            //"蒋干 蒋钦 蒋琬 谯周 沮授 阚泽 孔融 蒯良 蒯越  " +
            //"乐进 李典 李恢 李儒 李通 李严 梁习 廖化 凌统 刘巴  " +
            //"刘表 刘备 刘馥 刘焉 刘璋 刘繇 刘晔 刘虞 吕布  " +
            //"吕范 吕凯 吕蒙 吕虔 鲁肃 陆逊 卢植 马良 马谡 马钧  " +
            //"马日磾 马腾 马超 马岱 满宠 毛玠 孟达 糜竺 糜芳 弥横  " +
            //"潘璋 庞德 庞统 彭羕 秦宓 麴义 审配 士孙瑞 司马朗  " +
            //"司马懿 司马师 司马昭 孙坚"
        },

        initLotteryData: function () {
//        $.ajax({
//            type : "get",
//            url : "http://al-wuhc2.github.io/raiyee.lottery.data.github.com/lottery.js",
//            cache : false, //默认值true
//            dataType : "jsonp",
//            jsonpCallback : "lottery_data",
//            error : function() { alert("数据请求失败"); },
//            success : function(data) {
            var data = Lottery.settingData;
            if (typeof data.members == 'string') {
                data.members = data.members.match(/\S+/g);
            }


            Lottery.memberLs = data.members || [];
            Lottery.lotteryData = data.lotteryData || [];
            $.each(Lottery.lotteryData, function (index, item) {
                if (typeof item.memb == 'string') {
                    item.memb = item.memb.match(/\S+/g);
                }
                Lottery.memberLs = $.merge(Lottery.memberLs, item.memb || []);
                item.luckyDogs = [];
            });
            Lottery.resortItems();


//            }
//        });
        }
        , completeLottery: function () {
            window.sessionStorage.currentState = 'complete';

            var msg = "";

            $.each(Lottery.lotteryData, function (index, item) {
                var lotteryName = item.name; // 奖项名称
                msg += lotteryName + "(" + item.luckyDogs.length + "人):<p>" + item.luckyDogs.join('&nbsp;') + "<p>";
            });

            Lottery.showMultiLinesMessage(msg, 40);
            $('.helpdiv').hide();
        }
        , initialItem: function () {
            if (this.isComplete()) {
                this.completeLottery();
                return;
            }

            var itemOrder = Lottery.currentLotteryOrder;
            var item = Lottery.lotteryData[itemOrder];
            var lotteryName = item.name; // 奖项名称

            Lottery.showMessage(lotteryName + "&nbsp;" + item.predefinedNum + "名");
        }
        , resortItems: function () {
            var width = document.body.offsetWidth;
            var height = document.body.offsetHeight;
            $("#lotteryPage").css({width: width + "px", height: height + "px"});

            var memberCount = Lottery.memberLs.length;
            var gridCount = Math.ceil(Math.sqrt(memberCount));
            var widthGridSize = width / (gridCount + 1.);
            var heightGridSize = height / (gridCount + 1.);
            var itemSize = Math.max(widthGridSize, heightGridSize);
            var offsetSize = itemSize / 5.;

            shuffle(Lottery.memberLs);
            var currX = 1, currY = 1;
            var lotteryContent = "";
            $.each(Lottery.memberLs, function (index, item) {
                var radius = Math.random() * Math.PI * 2;
                lotteryContent += "<div class='lotteryItem' style='position:absolute;left:"
                + (widthGridSize * currX + Math.sin(radius) * offsetSize - itemSize / 2) + "px;top:"
                + (heightGridSize * currY + Math.cos(radius) * offsetSize - itemSize / 2) + "px;'>"
                + "<div style='position:relative;'><img src='images/normal.png' width='"
                + itemSize + "px' height='" + itemSize + "px'/>"
                + "<label style='top:-" + itemSize / 4. + "px;left:-" + itemSize / 4. + "px;width:" + itemSize * 1.5 + "px;height:" + itemSize * 1.5
                + "px;line-height:" + itemSize * 1.5 + "px;display:none;background:url(images/highlighted.png);background-size:contain;'>"
                + item + "</label></div></div>";
                ++currX;
                if (currX > gridCount) {
                    currX = 1;
                    ++currY;
                }
            });
            $("#lotteryPage").html(lotteryContent);
        }
        , showMessage: function (message) {
            $(".thickdiv").css({
                width: document.body.offsetWidth + "px",
                height: document.body.offsetHeight + "px",
                "line-height": document.body.offsetHeight + "px",
                "font-size": "120px"
            });
            $(".thickdiv").html(message);
            $(".thickdiv").show();
            $(".helpdiv").show();
        }
        , showMultiLinesMessage: function (message, fontSize) {
            $(".thickdiv").css({
                width: document.body.offsetWidth + "px",
                height: document.body.offsetHeight + "px",
                "line-height": "",
                "font-size": (fontSize || 100 ) + "px"
            });
            $(".thickdiv").html(message);
            $(".thickdiv").show();
            $(".helpdiv").show();
        }
        , hideMessage: function () {
            $(".thickdiv").hide();
            $(".helpdiv").hide();
        }
        , isComplete: function () {
            return Lottery.memberLs.length <= 0 || Lottery.currentLotteryOrder >= Lottery.lotteryData.length;
        }
        , startLottery: function () {
            if (this.isComplete()) {
                this.completeLottery();
                return;
            }

            window.sessionStorage.currentState = "lottery";
            Lottery.doLottery();
            Lottery.hideMessage();
        }
        , itemSummary: function () {
            var itemOrder = Lottery.currentLotteryOrder;
            var item = Lottery.lotteryData[itemOrder];
            var lotteryName = item.name; // 奖项名称
            Lottery.showMultiLinesMessage(
                lotteryName + "中奖者(" + item.luckyDogs.length + "):<p>" + item.luckyDogs.join('&nbsp;'));
        }
        , doLottery: function () {
            Lottery.nextRandomOrder();
            if (window.sessionStorage.currentState == "caculate") {
                Lottery.lotteryTimeInterval = 100;

                var itemOrder = Lottery.currentLotteryOrder;
                var item = Lottery.lotteryData[itemOrder];
                var lotteryName = item.name; // 奖项名称
                var luckyDog = Lottery.currentLotteryMember(); // 中奖人姓名

                Lottery.showMessage(lotteryName + "(" + (item.luckyDogs.length + 1) + "/" + item.predefinedNum + ")：" + luckyDog); // 中奖显示  三等奖：XXX
                window.sessionStorage.currentState = "standby"
            } else {
                setTimeout("Lottery.doLottery()", 50000. / Lottery.lotteryTimeInterval);

                if (window.sessionStorage.currentState == "lottery") {
                    Lottery.lotteryTimeInterval = Math.min(Lottery.lotteryTimeInterval + 100, 500);
                } else if (window.sessionStorage.currentState == "shutting") {
                    if (Lottery.lotteryTimeInterval == 100) window.sessionStorage.currentState = "standby";
                    Lottery.lotteryTimeInterval = Math.max(Lottery.lotteryTimeInterval - 100, 100);
                }
            }
        }
        , nextRandomOrder: function () {
            var memberCount = Lottery.memberLs.length;
            // at least increase 1
            var increase = parseInt(Math.random() * (memberCount - 1)) + 1;
            Lottery.currentMemberOrder = (Lottery.currentMemberOrder + increase) % memberCount;
            if (window.sessionStorage.currentState == "caculate" && Lottery.currentLotteryMemberList().length > 0) {
                while ($.inArray(Lottery.memberLs[Lottery.currentMemberOrder], Lottery.currentLotteryMemberList()) == -1) {
                    Lottery.currentMemberOrder = (Lottery.currentMemberOrder + 1) % memberCount;
                }
            }
            $(".lotteryItem").css("z-index", "auto").find("label").hide();
            $(".lotteryItem").eq(Lottery.currentMemberOrder).css("z-index", "5").find("label").show();
        }
        , currentLotteryMember: function () {
            return $(".lotteryItem").eq(Lottery.currentMemberOrder).find("label").text();
        }
        , stopLottery: function () {
            window.sessionStorage.currentState = "caculate";
        }
        , confirmLottery: function () {
            var itemOrder = Lottery.currentLotteryOrder;
            var item = Lottery.lotteryData[itemOrder];
            var luckyDog = Lottery.currentLotteryMember(); // 中奖人姓名
            item.luckyDogs.push(luckyDog);

            Lottery.memberLs.splice($.inArray(luckyDog, Lottery.memberLs), 1);
            Lottery.currentLotteryMemberList().splice($.inArray(luckyDog, Lottery.currentLotteryMemberList()), 1);
            Lottery.resortItems();
        }
        , currentLotteryMemberList: function () {
            return Lottery.lotteryData[Lottery.currentLotteryOrder].memb || [];
        }

    }
    ;

window.sessionStorage.currentState = "initial";

$(document).ready(function () {
    Lottery.initLotteryData();
    Lottery.initialItem();
});

$(document).keyup(function (e) {
    switch (e.which) {
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
