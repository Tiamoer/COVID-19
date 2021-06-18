package com.model;

import com.alibaba.fastjson.annotation.JSONField;

public class newsModel {
    @JSONField(name = "ID",serialize = false)
    private int newsID;
    @JSONField(name = "Date",ordinal = 1)
    private String newsDT;
    @JSONField(name = "Content",ordinal = 2)
    private String newsContent;
    @JSONField(name = "url",ordinal = 3)
    private String newsContentUrl;

    public int getNewsID() {
        return newsID;
    }

    public void setNewsID(int newsID) {
        this.newsID = newsID;
    }

    public String getNewsDT() {
        return newsDT;
    }

    public void setNewsDT(String newsDT) {
        this.newsDT = newsDT;
    }

    public String getNewsContent() {
        return newsContent;
    }

    public void setNewsContent(String newsContent) {
        this.newsContent = newsContent;
    }

    public String getNewsContentUrl() {
        return newsContentUrl;
    }

    public void setNewsContentUrl(String newsContentUrl) {
        this.newsContentUrl = newsContentUrl;
    }
}
