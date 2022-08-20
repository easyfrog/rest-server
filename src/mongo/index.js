var getCollection = require('./mongoConnection').getCollection
var dbfunc = require('./dbfunc')

// user collection is async Function
var userColFunc = getCollection('user')

exports.insertOne = async data => {
	var col = await userColFunc()
	var result = await col.insertOne(data)

	return result
}

exports.getCollection = getCollection
exports.dbfunc = dbfunc

