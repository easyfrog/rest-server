# run_func_serve

用于在服务端运行前端传来的函数, 可用于操作MongoDB数据库以及处理文件上传等

## init

```js
var rfs = require('run_func_serve')

// 初始化
// 设置默认的数据库名, 默认为 base
// 以及一个可以通过名称得到对应数据库的 async 方法
rfs.init({
	db_name: 'base',
	getDB: null
})

// 通过接口调用
route.post('/func', async (req, res) => {
	await rfs.run_func(req, res)
})
```

## 在前端使用

前端引入 `run_func_client.js`

```js
import rfc from "run_func_serve/run_func_client";


// 初始化, 默认值: 'http://localhost:3002'
func.init({server: ''})

// 远程运行, 处理数据库(MongoDB)
func.run(async db => {
	var res = await db.collection('users').find({}, {projection: {_id: 0}).toArray()
	return res
}).then()

// 其它形式, 支持队列及参数数组
func.run('queue', function)
func.run([param1, param2, ...], function)
func.run('queue', [param1, param2, ...], function)

// 文件上传, 支持多文件上传, files: fileList.files
func.upload(files).then()
```

**注意:** 如果前端进行代码压缩, 需要保留 `db` 字段

```js
terser({
	compress: {
		// drop_console: true
	},
	mangle: {
		reserved: [
			'db' 		// db, prom for run_func_serve
		]
	}
}
```