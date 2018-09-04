const winston = require('winston')
require('winston-daily-rotate-file')

let {format, createLogger, transports} = winston
let {Console, DailyRotateFile} = transports

let winstonLogger =  createLogger({
  level: 'info',
  format: format.combine(
    format.splat(),
    format.simple()
  ),
  transports:[
    new DailyRotateFile({
      name: 'info_logger',    //多个同类型 transport 要定义不同的name
      filename: './logs/%DATE%.info.log',
      datePattern:'YYYY_MM_DD',
      level:'info'
    }),
    new DailyRotateFile({
      name: 'error_logger',
      filename: './logs/%DATE%.error.log',
      datePattern:'YYYY_MM_DD', 
      level:'error' }), 
    ]
   })

// 封装自定义的 logger (level, msg,meta)
function logger(...args) {
  
  // log(level, msg, meta) {
  winstonLogger.log(...args)
}

module.exports = logger