
//
// 通过使用 multer 处理文件上传
//

// use for path.extname
var path = require('path')

// 
// multer for upload files
// 
const multer  = require('multer')

// 
// multer's diskStorage config
// 
const storage = multer.diskStorage({

	// 设置文件存放的位置
	// 这里我们放在public/uploads目录中
	// 在index.js中将public为静态目录
	// 可以直接使用http://localhost:3000/uploads/file-new-name.png访问上传之后的文件
	destination: function (req, file, cb) {
		// ./public/uploads folder must exist!
		cb(null, './public/uploads')
	},

	// 将文件名进行修改, 为了避免上传文件时的名称冲突
	filename: function (req, file, cb) {
		// origin name utf8
		file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');

		// new file name like 1662562964513-417990203.mp3
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
		cb(null, uniqueSuffix + path.extname(file.originalname))
	}

})

// create multer instance
module.exports = multer({ storage: storage })




