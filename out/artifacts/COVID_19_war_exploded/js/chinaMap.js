$.ajax({
    url: "https://news.sina.com.cn/project/fymap/ncp2020_full_data.json",
    dataType: "jsonp",
    jsonpCallback: 'jsoncallback',
    success: function (response) {

        // 获取数据
        var allData = response.data;
        console.log(allData);

        // 设置数据的获取时间
        var cachetime = allData.cachetime;
        $('.time span').html(cachetime);

        // 折线图
        (function () {
            var chartDom = document.getElementById('line');
            var myChart = echarts.init(chartDom);
            var option;

            option = {
                // title: {
                //     text: '折线图'
                // },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: ['数据1', '数据2', '数据3', '数据4'],
                    top: 15
                },
                grid: {
                    left: 0,
                    right: 0,
                    bottom: 0,
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: ['日期1', '日期2', '日期3', '日期4', '日期5', '日期6', '日期7'],
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        name: '数据1',
                        type: 'line',
                        stack: '总量',
                        data: [120, 132, 101, 134, 90, 230, 210]
                    },
                    {
                        name: '数据2',
                        type: 'line',
                        stack: '总量',
                        data: [220, 182, 191, 234, 290, 330, 310]
                    },
                    {
                        name: '数据3',
                        type: 'line',
                        stack: '总量',
                        data: [150, 232, 201, 154, 190, 330, 410]
                    },
                    {
                        name: '数据4',
                        type: 'line',
                        stack: '总量',
                        data: [320, 332, 301, 334, 390, 330, 320]
                    },
                ]
            };

            option && myChart.setOption(option);
        })();

        // 饼图
        (function () {
            var chartDom = document.getElementById('pie');
            var pie = echarts.init(chartDom);
            var option;

            option = {
                legend: {
                    top: 'bottom'
                },
                series: [
                    {
                        name: '面积模式',
                        type: 'pie',
                        radius: [0, 50],
                        center: ['50%', '50%'],
                        roseType: 'area',
                        itemStyle: {
                            borderRadius: 8
                        },
                        data: [
                            { value: 40, name: '数据1' },
                            { value: 38, name: '数据2' },
                            { value: 32, name: '数据3' },
                            { value: 30, name: '数据4' },
                        ]
                    }
                ]
            };

            option && pie.setOption(option);

        })();

        // 国内外数据展示
        (function () {
            showChinaInfo(allData);
            showChinaMap(allData);
            $("#china").click(function (e) {
                $("#world").removeClass("click");
                $(this).addClass("click");
                $('.map').removeClass("map2");
                showChinaMap(allData);
                showChinaInfo(allData);
            });
            $("#world").click(function (e) {
                $("#china").removeClass("click");
                $(this).addClass("click");
                $('.map').addClass("map2");
                showWorldMap(allData);
                showWorldInfo(allData);
            });
        })();

        // 境外输入排行榜展示
        (function () {
            // 获取境外输入派上榜信息
            var jwsr_data = allData.jwsrTop;
            // 字典存数据据
            var jwsrName = [];
            var jwsrValue = [];
            // 境外输入总人数
            // var jwsrconNum = allData.historylist[0]['cn_jwsrNum']
            // jwsrName.push("总输入");
            // jwsrValue.push(jwsrconNum);
            var i = 1;
            try {
                jwsr_data.forEach(element => {
                    if (i <= 5) {
                        jwsrName.push(element.name);
                        jwsrValue.push(element.jwsrNum);
                        i++;
                    } else {
                        throw new Error("EndIterative");
                    }
                });
            } catch (error) {
                if (error.message !== "EndIterative") throw error;
            };
            // 倒置两个数组元素的顺序
            jwsrName.reverse();
            jwsrValue.reverse();
            // 图表设置
            var jwsrTop = echarts.init(document.getElementById('jwsr_top'));
            var option = {
                title: {
                    text: '境外输入人数地区TOP5',
                    left: 'center',
                    top: 20
                },
                grid: {
                    left: 50,
                    bottom: 17
                },
                legend: {
                    data: ['人数'],
                    left: 'left',
                    top: 30
                },
                xAxis: {
                    type: 'value',
                    boundaryGap: [0, 0.01]
                },
                yAxis: {
                    type: 'category',
                    data: jwsrName,
                    nameTextStyle: {
                        fontSize: 5,
                        lineHeight: 56
                    }
                },
                series: [
                    {
                        name: '人数',
                        type: 'bar',
                        data: jwsrValue,
                        label: {
                            show: 'true',
                            position: 'right'
                        }
                    }
                ]
            }
            jwsrTop.setOption(option);
        })();
        
        // 新闻列表展示
        (function () {
            $.ajax({
                type: "GET",
                url: "newsServlet",
                dataType: "json",
                // async:false,
                success: function (response) {
                    var newList = response;
                    var htmlStr = "";
                    console.log(newList);
                    newList.forEach(element => {
                        htmlStr += `
                            <li><a href="${element['url']} target="view_window">${element['Content']}</a></li>
                        `
                    });
                    $('.newList > ul').html(htmlStr);
                }
            });
        })();

        // 新闻列表滚动动效
        (function () {
                var $this = $(".newList");
                var scrollTimer;
                $this.hover(function () {
                    clearInterval(scrollTimer);
                }, function () {
                    scrollTimer = setInterval(function () {
                        scrollNews($this);
                    }, 2000);
                }).trigger("mouseleave");
        })();
    }
})

// 中国疫情信息栏
function showChinaInfo(allData) {
    $('.info').empty();
    $('#info_title').text("全国(含港澳台)");
    var historyList = allData.historylist;
    // 配置对象
    var infoConfig = {
        "cn_econNum": {
            "title": "现有确诊",
            "color": "#ff3535"
        },
        "cn_asymptomNum": {
            "title": "现存无症状",
            "color": "#FE9986"
        },
        "cn_susNum": {
            "title": "现存疑似",
            "color": "#A36FFF"
        },
        "cn_heconNum": {
            "title": "现存确诊重症",
            "color": "#8A121C"
        },
        "cn_jwsrNum": {
            "title": "境外输入",
            "color": "#FE6B23"
        },
        "cn_cureNum": {
            "title": "累计治愈",
            "color": "#13B593"
        },
        "cn_deathNum": {
            "title": "累计死亡",
            "color": "#4B4B4B"
        },
        "cn_conNum": {
            "title": "累计确诊",
            "color": "#B10000"
        },
    }
    var htmlStr = "";
    for (var k in infoConfig) {
        var temp = historyList[0][k] - historyList[1][k];
        htmlStr += `
        <div class="info_item">
            <h5 style="color: ${infoConfig[k].color}">${infoConfig[k].title}</h5>
            <b style="color: ${infoConfig[k].color};font-size:24px">${historyList[0][k]}</b>
            <br>
            <span>
                <p class="jzr">较昨日</p>
                <i style="color: ${infoConfig[k].color};">
                    ${temp >= 0 ? "+" + temp : temp}
                </i>
            </span>
        </div>
        `
        $('.info').html(htmlStr);
    }
}

function showWorldInfo(allData) {
    $('.info').empty();
    $('#info_title').text("全球疫情数据");
    // 获取当前的世界疫情统计信息
    var otherTotal = allData.othertotal;
    // 获取前一天的世界疫情信息
    var otherHistory = allData.otherhistorylist;

    console.log(otherTotal);
    console.log(otherHistory);
    // 配置对象
    var infoConfig = {
        "certain": {
            "title": "累计确诊",
            "color": "#B10000"
        },
        "die": {
            "title": "累计死亡",
            "color": "#4B4B4B"
        },
        "recure": {
            "title": "累计治愈",
            "color": "#13B593"
        }
    }
    var htmlStr = "";
    for (var k in infoConfig) {
        var temp = 0;
        if (k === "recure") {
            temp = otherTotal[k] - otherHistory[0]["recure"];
        } else {
            temp = otherTotal[k] - otherHistory[0][k];
        }
        htmlStr += `
        <div class="info_item" style="width:33%">
            <h5 style="color: ${infoConfig[k].color}">${infoConfig[k].title}</h5>
            <b style="color: ${infoConfig[k].color};font-size:24px">${otherTotal[k]}</b>
            <br>
                <span>
                    <p class="jzr">较昨日</p>
                    <i style="color: ${infoConfig[k].color};">
                        ${temp >= 0 ? "+" + temp : temp}
                    </i>
                </span>
        </div>`
        $('.info').html(htmlStr);

    }
}

// 中国疫情地图
function showChinaMap(allData) {
    var list = allData.list;
    // 地图Dom
    var mapDom = echarts.init(document.getElementById('map'));
    window.addEventListener("resize", function () {
        mapDom.resize();
    });
    // 中国疫情
    var nowList = [];
    var allList = [];
    list.forEach(element => {
        nowList.push({
            name: element.name,
            value: element.econNum
        });
        allList.push({
            name: element.name,
            value: element.value
        });
    });
    var china_option = {
        backgroundColor: '#fff',
        tooltip: {
            show: 'true',
            trigger: 'item',
            triggerOn: 'mousemove|click',
            padding: 3,
            borderColor: '#333',
            enterable: true,
            backgroundColor: 'rgba(50,50,50,0.7)',
            textStyle: {
                color: '#fff',
            },
            formatter: function (param) {
                return `<section style="display: flex; align - items: center; position: relative; z - index: 9999; ">
                                    <div> 地区:${param.name}<br>确诊:${param.value}</div>
                                </section >`;
            }
        },
        visualMap: [
            {
                type: 'piecewise',
                pieces: [
                    { min: 0, max: 0, label: '0' },
                    { min: 1, max: 9, label: '1-9' },
                    { min: 10, max: 99, label: '10-99' },
                    { min: 100, max: 999, label: '100-999' },
                    { min: 1000, max: 9999, label: '1000-9999' },
                    { min: 10000, label: '≥10000' },
                ],
                itemWidth: 10,
                itemHeight: 10,
                itemGap: 2,
                inverse: false
            }
        ],
        geo: {
            map: 'china',
            show: 'true',
            zoom: 1.2,
            label: {
                show: true,
                fontSize: 10
            },
            itemStyle: {
                areaColor: '#fff',
                borderWidth: 0.5,
            }
        },
        series: [
            {
                type: 'map',
                geoIndex: 0,
                data: nowList
            }
        ]
    }
    mapDom.clear();
    mapDom.setOption(china_option);
}

// 世界疫情地图
function showWorldMap(allData) {
    // 地图Dom
    var mapDom = echarts.init(document.getElementById('map'));
    window.addEventListener("resize", function () {
        mapDom.resize();
    });
    // 世界疫情
    var otherAllData = allData.otherlist;
    var otherList = [];
    otherAllData.forEach(element => {
        otherList.push({
            name: element.name,
            value: element.value
        });
    });
    // 添加中国总感染信息
    otherList.push({
        name: "中国",
        value: allData.historylist[0]["cn_conNum"]
    });
    // 地图名称映射集 
    var nameMap = {
        "Afghanistan": "阿富汗",
        "Albania": "阿尔巴尼亚",
        "Algeria": "阿尔及利亚",
        "Angola": "安哥拉",
        "Argentina": "阿根廷",
        "Armenia": "亚美尼亚",
        "Australia": "澳大利亚",
        "Austria": "奥地利",
        "Azerbaijan": "阿塞拜疆",
        "Bahamas": "巴哈马",
        "Bahrain": "巴林",
        "Bangladesh": "孟加拉国",
        "Belarus": "白俄罗斯",
        "Belgium": "比利时",
        "Belize": "伯利兹",
        "Benin": "贝宁",
        "Bhutan": "不丹",
        "Bolivia": "玻利维亚",
        "Bosnia and Herz.": "波黑",
        "Botswana": "博茨瓦纳",
        "Brazil": "巴西",
        "British Virgin Islands": "英属维京群岛",
        "Brunei": "文莱",
        "Bulgaria": "保加利亚",
        "Burkina Faso": "布基纳法索",
        "Burundi": "布隆迪",
        "Cambodia": "柬埔寨",
        "Cameroon": "喀麦隆",
        "Canada": "加拿大",
        "Cape Verde": "佛得角",
        "Cayman Islands": "开曼群岛",
        "Central African Rep.": "中非共和国",
        "Chad": "乍得",
        "Chile": "智利",
        "China": "中国",
        "Colombia": "哥伦比亚",
        "Comoros": "科摩罗",
        "Congo": "刚果（布）",
        "Costa Rica": "哥斯达黎加",
        "Croatia": "克罗地亚",
        "Cuba": "古巴",
        "Cyprus": "塞浦路斯",
        "Czech Rep.": "捷克",
        "Côte d'Ivoire": "科特迪瓦",
        "Dem. Rep. Congo": "刚果（金）",
        "Dem. Rep. Korea": "朝鲜",
        "Denmark": "丹麦",
        "Djibouti": "吉布提",
        "Dominican Rep.": "多米尼加",
        "Ecuador": "厄瓜多尔",
        "Egypt": "埃及",
        "El Salvador": "萨尔瓦多",
        "Eq. Guinea": "赤道几内亚",
        "Eritrea": "厄立特里亚",
        "Estonia": "爱沙尼亚",
        "Ethiopia": "埃塞俄比亚",
        "Falkland Is.": "福克兰群岛",
        "Fiji": "斐济",
        "Finland": "芬兰",
        "Fr. S. Antarctic Lands": "所罗门群岛",
        "France": "法国",
        "Gabon": "加蓬",
        "Gambia": "冈比亚",
        "Georgia": "格鲁吉亚",
        "Germany": "德国",
        "Ghana": "加纳",
        "Greece": "希腊",
        "Greenland": "丹麦", // 格陵兰 -> 丹麦属下
        "Guatemala": "危地马拉",
        "Guinea": "几内亚",
        "Guinea-Bissau": "几内亚比绍",
        "Guyana": "圭亚那",
        "Haiti": "海地",
        "Honduras": "洪都拉斯",
        "Hungary": "匈牙利",
        "Iceland": "冰岛",
        "India": "印度",
        "Indonesia": "印度尼西亚",
        "Iran": "伊朗",
        "Iraq": "伊拉克",
        "Ireland": "爱尔兰",
        "Isle of Man": "马恩岛",
        "Israel": "以色列",
        "Italy": "意大利",
        "Jamaica": "牙买加",
        "Japan": "日本",
        "Jordan": "约旦",
        "Kazakhstan": "哈萨克斯坦",
        "Kenya": "肯尼亚",
        "Korea": "韩国",
        "Kuwait": "科威特",
        "Kyrgyzstan": "吉尔吉斯斯坦",
        "Lao PDR": "老挝",
        "Latvia": "拉脱维亚",
        "Lebanon": "黎巴嫩",
        "Lesotho": "莱索托",
        "Liberia": "利比里亚",
        "Libya": "利比亚",
        "Lithuania": "立陶宛",
        "Luxembourg": "卢森堡",
        "Macedonia": "北马其顿",
        "Madagascar": "马达加斯加",
        "Malawi": "马拉维",
        "Malaysia": "马来西亚",
        "Maldives": "马尔代夫",
        "Mali": "马里",
        "Malta": "马耳他",
        "Mauritania": "毛里塔尼亚",
        "Mauritius": "毛里求斯",
        "Mexico": "墨西哥",
        "Moldova": "摩尔多瓦",
        "Monaco": "摩纳哥",
        "Mongolia": "蒙古国",
        "Montenegro": "黑山",
        "Morocco": "摩洛哥",
        "Mozambique": "莫桑比克",
        "Myanmar": "缅甸",
        "Namibia": "纳米比亚",
        "Nepal": "尼泊尔",
        "Netherlands": "荷兰",
        "New Caledonia": "新喀里多尼亚",
        "New Zealand": "新西兰",
        "Nicaragua": "尼加拉瓜",
        "Niger": "尼日尔",
        "Nigeria": "尼日利亚",
        "Norway": "挪威",
        "Oman": "阿曼",
        "Pakistan": "巴基斯坦",
        "Panama": "巴拿马",
        "Papua New Guinea": "巴布亚新几内亚",
        "Paraguay": "巴拉圭",
        "Peru": "秘鲁",
        "Philippines": "菲律宾",
        "Poland": "波兰",
        "Portugal": "葡萄牙",
        "Puerto Rico": "波多黎各",
        "Qatar": "卡塔尔",
        "Reunion": "留尼旺",
        "Romania": "罗马尼亚",
        "Russia": "俄罗斯",
        "Rwanda": "卢旺达",
        "S. Geo. and S. Sandw. Is.": "南乔治亚和南桑威奇群岛",
        "S. Sudan": "南苏丹",
        "San Marino": "圣马力诺",
        "Saudi Arabia": "沙特阿拉伯",
        "Senegal": "塞内加尔",
        "Serbia": "塞尔维亚",
        "Sierra Leone": "塞拉利昂",
        "Singapore": "新加坡",
        "Slovakia": "斯洛伐克",
        "Slovenia": "斯洛文尼亚",
        "Solomon Is.": "所罗门群岛",
        "Somalia": "索马里",
        "South Africa": "南非",
        "Spain": "西班牙",
        "Sri Lanka": "斯里兰卡",
        "Sudan": "苏丹",
        "Suriname": "苏里南",
        "Swaziland": "斯威士兰",
        "Sweden": "瑞典",
        "Switzerland": "瑞士",
        "Syria": "叙利亚",
        "Tajikistan": "塔吉克斯坦",
        "Tanzania": "坦桑尼亚",
        "Thailand": "泰国",
        "Togo": "多哥",
        "Tonga": "汤加",
        "Trinidad and Tobago": "特立尼达和多巴哥",
        "Tunisia": "突尼斯",
        "Turkey": "土耳其",
        "Turkmenistan": "土库曼斯坦",
        "U.S. Virgin Islands": "美属维尔京群岛",
        "Uganda": "乌干达",
        "Ukraine": "乌克兰",
        "United Arab Emirates": "阿拉伯联合酋长国",
        "United Kingdom": "英国",
        "United States": "美国",
        "Uruguay": "乌拉圭",
        "Uzbekistan": "乌兹别克斯坦",
        "Vanuatu": "瓦努阿图",
        "Vatican City": "梵蒂冈城",
        "Venezuela": "委内瑞拉",
        "Vietnam": "越南",
        "W. Sahara": "西撒哈拉",
        "Yemen": "也门",
        "Yugoslavia": "南斯拉夫",
        "Zaire": "扎伊尔",
        "Zambia": "赞比亚",
        "Zimbabwe": "津巴布韦"
    }

    var world_option = {
        backgroundColor: '#fff',
        tooltip: {
            show: 'true',
            trigger: 'item',
            triggerOn: 'mousemove|click',
            padding: 3,
            borderColor: '#333',
            enterable: true,
            backgroundColor: 'rgba(50,50,50,0.7)',
            textStyle: {
                color: '#fff',
            },
            formatter: function (param) {
                return `<section style="display: flex; align - items: center; position: relative; z - index: 9999; ">
                            <div> 地区:${param.name}<br>确诊:${param.value}</div>
                        </section >`;
            }
        },
        visualMap: [
            {
                type: 'piecewise',
                pieces: [
                    { min: 0, max: 9999, label: '0-1万' },
                    { min: 10000, max: 99999, label: '1万-10万' },
                    { min: 100000, max: 999999, label: '10万-100万' },
                    { min: 1000000, max: 9999999, label: '100万-1000万' },
                    { min: 10000000, label: '≥1000万' }
                ],
                itemWidth: 10,
                itemHeight: 10,
                itemGap: 2,
                inverse: false
            }
        ],
        geo: {
            map: 'world',
            show: 'true',
            zoom: 1.2,
            roam: true,
            layoutCenter: ['50%', '50%'],
            layoutSize: '100%',
            label: 'false',
            scaleLimit: { //滚轮缩放的极限控制
                min: 1,
                max: 3
            },
            itemStyle: {
                areaColor: '#fff',
                borderWidth: 0.5,
            }
        },
        nameMap: nameMap,
        series: [
            {
                type: 'map',
                geoIndex: 0,
                data: otherList
            }
        ]
    }
    mapDom.clear();
    mapDom.setOption(world_option);
}

// 新闻列表滚动
function scrollNews(obj) {
    var $self = obj.find("ul");
    var lineHeight = $self.find("li:first").height();
    $self.animate({
        "marginTop": -lineHeight + 'px'
    }, 600, function () {
        $self.css({
            marginTop: 0
        }).find("li:first").appendTo($self);
    })
}