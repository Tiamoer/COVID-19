package com.register;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * @author 自清闲
 */
public class DbRegister {

    private static final String DB_DRIVER;
    private static final String DB_URL;
    private static final String DB_USER;
    private static final String DB_PWD;

    static {
        Properties properties = new Properties();
        InputStream is = DbRegister.class.getClassLoader().getResourceAsStream("db.properties");
        try {
            properties.load(is);
        } catch (IOException e) {
            e.printStackTrace();
        }
        DB_DRIVER = properties.getProperty("dbDriver");
        DB_URL = properties.getProperty("dbURL");
        DB_USER = properties.getProperty("dbUser");
        DB_PWD = properties.getProperty("dbPwd");
    }

    public static String getDbDriver() {
        return DB_DRIVER;
    }

    public static String getDbUrl() {
        return DB_URL;
    }

    public static String getDbUser() {
        return DB_USER;
    }

    public static String getDbPwd() {
        return DB_PWD;
    }
}
