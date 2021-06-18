package com.dao;

import com.register.DbRegister;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/*
    连接数据库
 */
public class ConDB {

    public static Connection getCon() throws ClassNotFoundException, SQLException {
        // 连接数据库
        Class.forName(DbRegister.getDbDriver());
        return DriverManager.getConnection(DbRegister.getDbUrl(),DbRegister.getDbUser(),DbRegister.getDbPwd());
    }
}
