package com.service;

/*
    获取到所有新闻
 */

import com.alibaba.fastjson.JSONObject;
import com.dao.ConDB;
import com.model.NewsModel;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * @author 自清闲
 */
public class NewsService {
    public static String getNewsJsonToString() throws SQLException, ClassNotFoundException {
        List<NewsModel> newList = new ArrayList<>();
        Connection connection = ConDB.getCon();
        String sql = "select * from BauDuHot.hotsearch";
        Statement ps = connection.createStatement();
        ResultSet rs = ps.executeQuery(sql);
        while (rs.next()) {
            NewsModel news = new NewsModel();
            news.setNewsID(rs.getInt(1));
            news.setNewsDT(rs.getString(2));
            news.setNewsContent(rs.getString(3));
            news.setNewsContentUrl(rs.getString(4));
            newList.add(news);
        }
        return JSONObject.toJSONString(newList);
    }
}
