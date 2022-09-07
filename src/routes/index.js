var express = require('express')
var mongo = require('../mongo')

// for files upload
var upload = require('../utils/multer')

// base route
route = express.Router()

// 默认展示页面
route.get('/', (req, res) => {
	res.send('ooomap REST API server')
})

//
// db func api
// 可以前面直接写mongodb操作函数
//
route.post('/api', async (req, res) => {
	
	// commondb execute req function
	mongo.dbfunc(req.body).then(result => {

		console.log('/api result:', result)

		if (result instanceof Promise) {
			result.then(_res => {
				res.json(_res);
			}, err => {
				res.json(err);
			})
		} else {
			// response
			res.json(result);
		}

	})

})

//
// "cloud remote function"
//
route.post('/func', async (req, res) => {
	await mongo.run_func(req, res)
})

//
// 处理文件上传
//
route.post('/upload', upload.array('files', 20), (req, res) => {

	console.log('uploaded files:', req.files);

	// bulk actions
	var actions = [];
	req.files.forEach(f => {
		actions.push({
			updateOne: {
				filter: {filename: f.filename},
				update: {$set: f},
				upsert: true
			}
		})
	})

	// collection's name: files-upload
	mongo.getCollection('filesUpload')().then(col => {

		// use bulkWrite insert many commands at one time
		col.bulkWrite(actions, {ordered: false});

		// response
		res.json(req.files)

	})

})

module.exports = app => {
	app.use('/', route)
}




