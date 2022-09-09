var queue = require('./queue')

// AsyncFunction (is not a global object)
const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

var config = null

/**
 * config:
 * 		db_name,
 * 		getDB
 */
function init(_config) {
	config = Object.assign({
		db_name: 'base',
		getDB: null 			// getDB function
	}, _config)
}

/**
 * post request
 *
 * req: {
 * 		dbname:, 				// default is common
 * 		queue:, 				// string, 队列名称, 是否加入队列
 * 		params:, 				// function中用到的变量上下文 Array
 * 		function:, 				// function string
 * }
 * 
 * @example
 * 
 * // front end
 * ajax({
 * 		url:'https://localhost:3002',
 * 		queue: ,   							// 所在的队列
 * 		params:, 							// 上下文, 数组 Array
 * 		function: '',						// 函数体, function.toString()
 * })
 */
async function run_func(req, res) {

	if (!config) {
		console.warn('init first!')
		res.json({msg: 'server needs init run_func!'})
		return
	}

	var body = req.body

	// 先拿到 db 实例
	var db = await config.getDB(body.dbname || config.db_name)

	var pre = '{';

	// 将上下文数据转为字符串
	if (body.params) {
		var str = '';
		body.params.forEach((c, i) => {
			str += 'var param' + (i + 1) + '=' + JSON.stringify(c) + ';';
		})

		pre += str;
	}

	// 得到没有 { 的 function body
	var funBody = pre + body.function.substr(body.function.indexOf('{') + 1);

	console.log(funBody);

	// create the async function
	var fun = new AsyncFunction('db', funBody);

	// 如果需要加入队列	
	if (body.queue) {
		queue.appendQueue(body.queue, fun, db, res)
	} else {
		try{
			// invoke function
			var result = await fun(db);
			res.json(result)
		} catch(e) {
			res.send(e.message)
		}
	}
}

module.exports = {
	init,
	run_func
};



