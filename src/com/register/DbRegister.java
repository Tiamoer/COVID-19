package com.register;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class DbRegister {

    private static final String dbDriver;
    private static final String dbUrl;
    private static final String dbUser;
    private static final String dbPwd;

    static {
        Properties properties = new Properties();
        InputStream is = DbRegister.class.getClassLoader().getResourceAsStream("db.properties");
        try {
            properties.load(is);
        } catch (IOException e) {
            e.printStackTrace();
        }
        dbDriver = properties.getProperty("dbDriver");
        dbUrl = properties.getProperty("dbURL");
        dbUser = properties.getProperty("dbUser");
        dbPwd = properties.getProperty("dbPwd");
    }

    public static String getDbDriver() {
        return dbDriver;
    }

    public static String getDbUrl() {
        return dbUrl;
    }

    public static String getDbUser() {
        return dbUser;
    }

    public static String getDbPwd() {
        return dbPwd;
    }
}
