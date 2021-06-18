package com.service;

/*
    获取到所有新闻
 */

import com.alibaba.fastjson.JSONObject;
import com.dao.ConDB;
import com.model.newsModel;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class newsService {
    public static String getNewsJsonToString() throws SQLException, ClassNotFoundException {
        List<newsModel> newList = new ArrayList<>();
        Connection connection = ConDB.getCon();
        String sql = "select * from BauDuHot.hotsearch";
        Statement ps = connection.createStatement();
        ResultSet rs = ps.executeQuery(sql);
        while (rs.next()) {
            newsModel news = new newsModel();
            news.setNewsID(rs.getInt(1));
            news.setNewsDT(rs.getString(2));
            news.setNewsContent(rs.getString(3));
            news.setNewsContentUrl(rs.getString(4));
            newList.add(news);
        }
        return JSONObject.toJSONString(newList);
    }
}
