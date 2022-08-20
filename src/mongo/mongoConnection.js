var MongoClient = require('mongodb').MongoClient
var config = require('../../config')

// name: db
var _dbs = {}

// 得到数据库
async function getDB(name='base') {
	try {
		if (!_dbs[name]) {
			var client = new MongoClient(config.mongo_url, { useUnifiedTopology: true })
			await client.connect()
			_dbs[name] = await client.db(config.db_name)
		}
	} catch(e) {
		throw `连接数据库出错: ${name}`
	}

	return _dbs[name]
}

exports.getDB = getDB

// 获得collection
exports.getCollection = name => {
	var _col
	return async () => {
		if (!_col) {
			try {
				var db = await getDB()
				_col = await db.collection(name)
			} catch(e) {
				throw '获得collection出错'
			}
		}

		return _col
	}
}

