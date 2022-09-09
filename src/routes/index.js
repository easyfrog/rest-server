var express = require('express')

// 因为我们将run_func.js做为了一个独立的包发布在了
// npmjs.com上, 所以mongo文件夹中有一个package.json文件
// 设置了 main, 所以这里需要显示的引入 /mongo/index
var mongo = require('../mongo/index')
var config = require('../../config')

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
// 可以前面直接写mongodb操作函数及处理文件上传等
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
// client method is func.run(async db => {})
// 可以在客户端编写mongodb操作函数到服务端执行以及处理文件上传等
//
route.post('/func', async (req, res) => {
	await mongo.run_func(req, res)
})

//
// 处理文件上传
// client method is func.upload(fileList)
//
route.post('/upload', upload.array('files', 20), async (req, res) => {

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

	var col = await mongo.getCollection('filesUpload')()

	// use bulkWrite insert many commands at one time
	col.bulkWrite(actions, {ordered: false});

	// response
	res.json(req.files)

})

module.exports = app => {
	app.use('/', route)
}




