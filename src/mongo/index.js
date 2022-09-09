var mc = require('./mongoConnection')
var rf = require('./run_func')
var dbfunc = require('./dbfunc')

var config = require('../../config')

console.log('1111')

// 初始化 run_func
// 设置默认的 db_name 和 getDB 方法
rf.init({
	db_name: config.db_name,
	getDB: mc.getDB
})
console.log('11112222')

exports.getDB = mc.getDB
exports.getCollection = mc.getCollection
exports.dbfunc = dbfunc
exports.run_func = rf.run_func

