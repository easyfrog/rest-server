var config = require('../../config')

// AsyncFunction (is not a global object)
const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

var getDB = require('./mongoConnection').getDB

/**
 * post request
 *
 * req: {
 * 		dbname:, 				// default is common
 * 		context:, 				// function中用到的变量上下文 Array
 * 		queue:, 				// string, 队列名称, 是否加入队列
 * 		funcion:, 				// function string
 * }
 * 
 * @example
 * 
 * // front end
 * ajax({
 * 		url:'https://node.ooomap.com/commondb',
 * 		dbname: ,   											// 请求内容object
 * 		context:, 												// 上下文, 数组 Array
 * 		function: '',											// 数据体
 * })
 */
async function run_func(req, res) {

	var body = req.body

	// 先拿到 db 实例
	var db = await getDB(body.dbname || config.db_name)

	var pre = '{';

	// 将上下文数据转为字符串
	if (body.context) {
		var str = '';
		body.context.forEach((c, i) => {
			str += 'var param' + (i + 1) + '=' + JSON.stringify(c) + ';';
		})

		pre += str;
	}

	// 得到没有 { 的 function body
	var funBody = pre + body.function.substr(body.function.indexOf('{') + 1);

	console.log(funBody);

	// create the async function
	var fun = new AsyncFunction('db', funBody);

	var result 

	try{

		// invoke function
		result = await fun(db);

	} catch(e) {

		result = e.message

	}

	res.json(result)

}

module.exports = run_func;



