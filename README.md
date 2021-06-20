# 疫情可视化

项目[演示](https://occn.top/COVID-19/)地址：https://occn.top/COVID-19/

## 前端

**页面：** HTML+LESS+Javascript+Jquery

​		HMTL+LESS+Flexible 主要完成对页面的静态框架设计

​		Javascript和JQuery主要完成页面动效的设计和数据处理

**可视化模块：**Echarts

​        Echarts是一个基于 JavaScript 的开源可视化图表库，完成对页面中图表和地图的展示

**数据请求：**Ajax

​        使用JQuery的Ajax请求，获取来自服务器的数据，然后将数据处理后反馈给可视化组件Echarts

## 后端

**数据获取：**Python人工爬虫

​        使用Python人工爬虫定时爬取与疫情有关的数据和新闻，并将其存储在服务器的数据库上

**数据处理和响应：**SpringMVC和FastJSON

​        使用JavaWeb项目常用的SpringMVC项目结构，对从数据库中获取到的数据使用Alibaba的FastJSON将其封装为一个JSON字符串后响应给前端。

