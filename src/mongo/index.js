var mc = require('./mongoConnection')
var rf = require('./run_func')

var config = require('../../config')

// 初始化 run_func
// 设置默认的 db_name 和 getDB 方法
rf.init({
	db_name: config.db_name,
	getDB: mc.getDB
})

exports.getDB = mc.getDB
exports.run_func = rf.run_func
exports.getCollection = mc.getCollection

