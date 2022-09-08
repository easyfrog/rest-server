
/**
 * 
 * 初始化, 默认值: 'http://localhost:3002'
 * func.init({server: ''})
 * 
 * 远程运行, 处理数据库(MongoDB)
 * func.run(async db => {
 * 		var res = await db.collection('users').find({}, {projection: {_id: 0}).toArray()
 * 		return res
 * }).then()
 *
 * 其它形式, 支持队列及参数数组
 * func.run('queue', function)
 * func.run([param1, param2, ...], function)
 * func.run('queue', [param1, param2, ...], function)
 *
 * 文件上传, 支持多文件上传, files: fileList.files
 * func.upload(files).then()
 * 
 */
export default {

	// rest-server docker default url
	server: 'http://localhost:3002',

	// initialize
	init: function(config) {
		if (config.server) {
			this.server = config.server
		}
	},

	// run func api in server
	// run( function )
	// run( 'queue-name', function )
	// run( params[], function )
	// run( 'queue-name', params[], function )
	run: async function() {

		var args = Array.from(arguments)

		var queue, params

		// function is at end of parameters
		var func = args[args.length - 1]

		if (args.length === 2) {
			if (Array.isArray(args[0])) {
				params = args[0]
			} else if ( typeof args[0] === 'string') {
				queue = args[0]
			}
		} else if (args.length === 3) {
			queue = args[0]
			params = args[1]
		}

		// data
		var data = {
			function: func.toString()
		}

		if (params) {
			data.params = params
		}

		if (queue) {
			data.queue = queue
		}

		// fetch
		var response = await fetch(`${this.server}/func`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json;charset=utf-8',
			},
			body: JSON.stringify(data),
		})

		// json
		var result = await response.json()

		return result

	},

	// upload files
	// fileList: input.files
	upload: async function (fileList) {
		var formData = new FormData();

		Array.from(fileList).forEach(file => {
			formData.append('files', file);
		})

		var response = await fetch(`${this.server}/upload`, {
			method: 'POST',
			body: formData
		})

		var result = await response.json()

		return result
	}

}