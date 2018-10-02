# 项目说明
An Express-MySQL User Base App

#
# 启动服务器
~~~
npm run start
~~~
# 启动前配置 .env 文件
请参考 .env.default 定义一个 .env 文件以完成node运行环境和数据库连接配置 

# 文件结构:
* 服务器入口文件: ```/bin/www```
* 路由配置:```/routes```
* 服务器环境配置 ```.env```
* 日志模块: ```/utils/logger```
* 日志文件: ```/logs```



# 项目依赖和实现 
## 模板引擎
handlerbars
## 数据库
mysqljs/mysql
## node环境配置
dotenv 
## 表单验证
通过 express-validator 实现后台表单验证.  
## hash user password
bcrypt
## session
express-session
## session store
express-mysql-session
## anthentication
passport & passport-local
## Logger
winston & winston-daily-rotate-file
## process manager
pm2




