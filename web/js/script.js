var ajax_Options = {
    // 新浪的疫情数据接口 返回的是jsonp格式的数据
    url: "https://news.sina.com.cn/project/fymap/ncp2020_full_data.json",
    dataType: "jsonp",
    jsonpCallback: 'jsoncallback',
    success: function (response) {
        // 获取数据
        const allData = response.data;
        // console.log(allData);
        // 设置数据的获取时间
        const cachetime = allData.cachetime;
        $('.time span').html(cachetime);
        // 折线图-
        showLine(allData);
        // 饼图-
        showPie(allData);
        // 柱状图-境外输入排行榜展示
        showBar(allData);
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

        // 新闻列表展示
        (function () {
            $.ajax({
                type: "GET",
                url: "NewsServlet",
                dataType: "json",
                // async:false,
                success: function (response) {
                    const newList = response;
                    let htmlStr = "";
                    console.log(newList);
                    newList.forEach(element => {
                        // element -> k-v
                        htmlStr += `
                                <li><a href="${element['url']}" target="_blank">${element['Content']}</a></li>
                            `
                    });
                    $('.newList > ul').html(htmlStr);
                    // 新闻列表滚动动效
                    newsStyle();
                }
            });
        })();

        // 省份疫情数据展示
        (function () {
            showCity(echarts.init(document.getElementById('map')), allData);
        })();
    }
}
$.ajax(ajax_Options);
function main(){
    $.ajax(ajax_Options);
}
// 设置每隔5分钟提交一次Ajax请求 刷新一次数据
setInterval(main,1000*60*30);

// 中国疫情信息栏
function showChinaInfo(allData) {
    $('.info').empty();
    $('#info_title').text("全国(含港澳台)");
    const historyList = allData.historylist;
    // 配置对象
    const infoConfig = {
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
    };
    let htmlStr = "";
    for (const k in infoConfig) {
        const temp = historyList[0][k] - historyList[1][k];
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

    // console.log(otherTotal);
    // console.log(otherHistory);
    // 配置对象
    const infoConfig = {
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
    };
    let htmlStr = "";
    for (const k in infoConfig) {
        let temp = 0;
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

// 折线图
function showLine(allData) {

    // 获取世界疫情信息
    const worldInfo = allData.otherhistorylist;
    let date, certain = [], die = [], recure = [];
    // 遍历获取日期、感染人数、死亡人数、治愈人数
    worldInfo.forEach(element => {
        date = element.date.replace(".", "-").replace(".", "-");
        certain.push([date, element.certain]);
        die.push([date, element.die]);
        recure.push([date, element.recure]);
    });

    // 按时间顺序排序
    certain.reverse();
    die.reverse();
    recure.reverse();

    // 图表配置
    const chartDom = document.getElementById('line');
    const myChart = echarts.init(chartDom);
    const option = {
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['感染人数', '死亡人数', '治愈人数'],
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
            splitLine: {
                show: false
            }
        },
        yAxis: {
            type: 'value'
        },
        dataZoom: {
            type: 'inside',
            start: 10,
            end: 50

        },
        series: [
            {
                name: '感染人数',
                type: 'line',
                stack: '人数',
                itemStyle: {
                    normal: {
                        color: '#FF3534',
                        lineStyle: {
                            color: '#FF3535'
                        }
                    }
                },
                data: certain
            },
            {
                name: '死亡人数',
                type: 'line',
                stack: '人数',
                itemStyle: {
                    normal: {
                        color: '#4B4B4B',
                        lineStyle: {
                            color: '#4B4B4B'
                        }
                    }
                },
                data: die
            },
            {
                name: '治愈人数',
                type: 'line',
                stack: '人数',
                itemStyle: {
                    normal: {
                        color: '#13B593',
                        lineStyle: {
                            color: '#13B593'
                        }
                    }
                },
                data: recure
            }
        ]
    };
    option && myChart.setOption(option);
}

// 饼图
function showPie(allData) {

    // 或缺全国现有确诊信息
    const info = allData.currenteconinfo;
    // cn_current_jwsrNum->境外输入,cn_gat_econNum->港澳台,cn_province_econNum->本土病例,econNum->全国当前病例总数
    let cn_current_jwsrNum, cn_gat_econNum, cn_province_econNum, econNum;

    cn_current_jwsrNum = info['cn_current_jwsrNum'];
    cn_gat_econNum = info['cn_gat_econNum'];
    cn_province_econNum = info['cn_province_econNum'];
    econNum = info['econNum'];

    const chartDom = document.getElementById('pie');
    const pie = echarts.init(chartDom);
    const subtext = "全国现有确诊";
    let option;

    option = {
        title: {
            text: '全国现有确诊构成',
            left: 'center',
            textStyle: {
                color: "#4D79F3"
            }
        },
        tooltip: {
            trigger: 'item'
        },
        legend: {
            // orient: 'vertical',
            bottom: '5'
        },
        series: [
            {
                name: '确诊人数',
                type: 'pie',
                radius: '50%',
                data: [
                    { value: cn_province_econNum, name: '本土病例' },
                    { value: cn_current_jwsrNum, name: '境外输入' },
                    { value: cn_gat_econNum, name: '港澳台病例' },
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };

    option && pie.setOption(option);
}

// 柱状图
function showBar(allData) {
    // 获取境外输入派上榜信息
    const jwsr_data = allData.jwsrTop;
    // 字典存数据据
    const jwsrName = [];
    const jwsrValue = [];
    // 境外输入总人数
    // var jwsrconNum = allData.historylist[0]['cn_jwsrNum']
    // jwsrName.push("总输入");
    // jwsrValue.push(jwsrconNum);
    let i = 1;
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
    }
    // 倒置两个数组元素的顺序
    jwsrName.reverse();
    jwsrValue.reverse();
    // 图表设置
    const jwsrTop = echarts.init(document.getElementById('jwsr_top'));
    const option = {
        title: {
            text: '境外输入人数地区TOP5',
            left: 'center',
            top: 10,
            textStyle: {
                color: "#4D79F3"
            }
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
    };
    jwsrTop.setOption(option);
}

// 中国疫情地图
function showChinaMap(allData) {
    const list = allData.list;
    // echarts的初始化语句
    const mapDom = echarts.init(document.getElementById('map'));
    // 让图表跟随父div的大小变化而变化
    window.addEventListener("resize", function () {
        mapDom.resize();
    });
    // 中国今天疫情
    const nowList = [];
    // 中国历史疫情数据
    const allList = [];
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
    // echarts配置项
    const china_option = {
        backgroundColor: '#fff',
        // 悬浮窗
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
                    {min: 0, max: 0, label: '0'},
                    {min: 1, max: 9, label: '1-9'},
                    {min: 10, max: 99, label: '10-99'},
                    {min: 100, max: 999, label: '100-999'},
                    {min: 1000, max: 9999, label: '1000-9999'},
                    {min: 10000, label: '≥10000'},
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
            // 地图视觉缩放比
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
    };
    // 为了防止多个图表之间造成数据混淆和配置混淆，在使用一个新的图表前，清除前面图表的缓存
    mapDom.clear();
    mapDom.setOption(china_option);
}

// 世界疫情地图
function showWorldMap(allData) {
    // 地图Dom
    const mapDom = echarts.init(document.getElementById('map'));
    window.addEventListener("resize", function () {
        mapDom.resize();
    });
    // 世界疫情
    const otherAllData = allData.otherlist;
    const otherList = [];
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
    const nameMap = {
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
    };

    const world_option = {
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
                    {min: 0, max: 9999, label: '0-1万'},
                    {min: 10000, max: 99999, label: '1万-10万'},
                    {min: 100000, max: 999999, label: '10万-100万'},
                    {min: 1000000, max: 9999999, label: '100万-1000万'},
                    {min: 10000000, label: '≥1000万'}
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
    };
    mapDom.clear();
    mapDom.setOption(world_option);
}

// 新闻列表滚动
function newsStyle() {
    const $this = $(".newList");
    let scrollTimer;
    $this.hover(function () {
        clearInterval(scrollTimer);
    }, function () {
        scrollTimer = setInterval(function () {
            scrollNews($this);
        }, 2000);
    }).trigger("mouseleave");
}
function scrollNews(obj) {
    const $self = obj.find("ul");
    const lineHeight = $self.find("li:first").height();
    $self.animate({
        "marginTop": -lineHeight + 'px'
    }, 600, function () {
        $self.css({
            marginTop: 0
        }).find("li:first").appendTo($self);
    })
}

// 省份疫情展示
function showCity(mapDom, allData) {

    // 获取所有的省份以及省份的疫情数据
    const cityList = allData.list;
    // 默认加载甘肃疫情数据
    initCityMap("甘肃", cityList);
    // 中国大地图的点击事件
    mapDom.on('click', function (params) {
        // 点击的省份
        const chooseCity = params.name;
        initCityMap(chooseCity, cityList);
    })
}

function initCityMap(cityName, cityList) {
    // 地名与文件名映射表
    const city_name = {
        "安徽": "anhui",
        "澳门": "aomen",
        "北京": "beijing",
        "重庆": "chongqing",
        "福建": "fujian",
        "甘肃": "gansu",
        "广东": "guangdong",
        "广西": "guangxi",
        "贵州": "guizhou",
        "海南": "hainan",
        "河北": "hebei",
        "黑龙江": "heilongjiang",
        "河南": "henan",
        "湖北": "hubei",
        "湖南": "hunan",
        "江苏": "jiangsu",
        "江西": "jiangxi",
        "吉林": "jilin",
        "辽宁": "liaoning",
        "内蒙古": "neimenggu",
        "宁夏": "ningxia",
        "青海": "qinghai",
        "山东": "shandong",
        "上海": "shanghai",
        "山西": "shanxi",
        "陕西": "shanxi2",
        "四川": "sichuan",
        "台湾": "taiwan",
        "天津": "tianjin",
        "香港": "xianggang",
        "新疆": "xinjiang",
        "西藏": "xizang",
        "云南": "yunnan",
        "浙江": "zhejiang",
    };
    // 地图名称映射集
    const nameMap = {
        /* 青海 */
        "西宁市": "西宁",
        "海北藏族自治州": "海北州",
        /* 湖北 */
        "恩施土家族苗族自治州": "恩施州",
        /* 黑龙江 */
        "大兴安岭地区": "大兴安岭",
        /* 吉林 */
        "延边朝鲜族自治州": "延边",
        /* 内蒙古 */
        "锡林郭勒盟": "锡林郭勒市",
        /* 甘肃 */
        "临夏回族自治州": "临夏州",
        "甘南藏族自治州": "甘南州",
        /* 新疆 */
        "巴音郭楞蒙古自治州": "巴州",
        "伊犁哈萨克自治州": "伊犁州",
        "昌吉回族自治州": "昌吉州",
        "喀什地区": "喀什",
        /* 四川 */
        "凉山彝族自治州": "凉山州",
        "阿坝藏族羌族自治州": "阿坝州",
        "甘孜藏族自治州": "甘孜州",
        /* 云南 */
        "红河哈尼族彝族自治州": "红河州",
        "文山壮族苗族自治州": "文山州",
        "西双版纳傣族自治州": "西双版纳",
        "楚雄彝族自治州": "楚雄州",
        "大理白族自治州": "大理州",
        "德宏傣族景颇族自治州": "德宏州",
        "湘西土家族苗族自治州": "湘西自治州",
        /* 贵州 */
        "黔西南布依族苗族自治州": "黔西南州",
        "黔东南苗族侗族自治州": "黔东南州",
        "黔南布依族苗族自治州": "黔南州",
        /* 重庆 */
        "秀山土家族苗族自治县": "秀山县",
        "酉阳土家族苗族自治县": "酉阳县",
        "彭水苗族土家族自治县": "彭水县",
        "石柱土家族自治县": "石柱县",
    };

    // 特殊地名，这些地名不加市
    const tsdm = ["海北州", "恩施州", "临夏州", "甘南州", "巴州", "伊犁州", "昌吉州", "凉山州", "阿坝州", "甘孜州", "红河州", "文山州", "楚雄州", "大理州", "德宏州", "湘西自治州", "黔西南州", "黔东南州", "黔南州"];
    const tsdm2 = ["喀什", "延边", "大兴安岭", "西宁", "西双版纳"];
    // 城市数据
    const cityInfo = [];
    let infoList = [];
    cityList.forEach(element => {
        if (cityName === element.name) {
            infoList = element.city;
            infoList.forEach(element => {
                let name = element.name;
                // 对json里的数据做尽可能格式处理，以便能够匹配地图名称
                if (cityName === "重庆") {

                    const cqtsCity = ["城口", "巫溪", "巫山", "奉节", "石柱", "云阳", "垫江", "丰都", "彭水", "酉阳", "秀山"];
                    if (cqtsCity.indexOf(name) !== -1) {
                        name = name.substr(0, 2);
                        name = name + "县";
                    } else if (name === "忠县") {
                        name = name;
                    } else {
                        name = name + "区";
                    }
                    // console.log(name);
                } else {
                    if (name.charAt(name.length - 1) !== '州' && name.charAt(name.length - 1) !== '区' && cityName !== "河南" && cityName !== "湖南") {
                        if (tsdm2.indexOf(name) === -1) {
                            name = name + "市";
                        }
                    }
                    else if (name.charAt(name.length - 1) === '州' && tsdm.indexOf(name) === -1) {
                        name = name + "市";
                    }
                }
                cityInfo.push({
                    name: name,
                    value: element.conNum
                });
            });
        };
    });
    // 一定不能使用../cityMap/xx.json 这种路径，破tomcat会识别路径错误
    $.get(document.URL+'/cityMap/' + city_name[cityName] + '.json', function (geoJson) {
        const myChart = echarts.init(document.getElementById("CityMap"));
        myChart.hideLoading();
        echarts.registerMap(city_name[cityName], geoJson);
        // console.log(2);
        const option = {
            backgroundColor: '#fff',
            title: {
                text: cityName,
                textStyle: {
                    color: "#4D79F3"
                }
            },
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
                    if (isNaN(param.value)) param.value = 0;
                    return `<section style="display: flex; align - items: center; position: relative; z - index: 9999; ">
                                        <div> 地区:${param.name}<br>确诊:${param.value}</div>
                                    </section >`;
                }
            },
            grid: {
                x: "10%",
                x2: "10%",
                y: "10%",
                y2: "10%"
            },
            visualMap: [
                {
                    type: 'piecewise',
                    pieces: [
                        {min: 0, max: 0, label: '0',},
                        {min: 1, max: 9, label: '1-9'},
                        {min: 10, max: 99, label: '10-99'},
                        {min: 100, max: 999, label: '100-999'},
                        {min: 1000, max: 9999, label: '1000-9999'},
                        {min: 10000, label: '≥10000'},
                    ],
                    itemWidth: 10,
                    itemHeight: 10,
                    itemGap: 2,
                    inverse: false
                }
            ],
            geo: {
                map: city_name[cityName],
                roam: true,
                show: 'true',
                zoom: 1.2,
                label: {
                    show: true,
                },
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
                    data: cityInfo
                }
            ]
        };
        myChart.clear();
        myChart.setOption(option);
    })
}