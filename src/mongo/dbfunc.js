var Prom = require('../utils/Promise');
var getDB = require('./mongoConnection').getDB

/**
 * 队列
 * @type {Object}
 * @example
 * {
 * 		queueName: [func1, func2, ...],
 * }
 */
var queue = {};

function appendQueue(name, func, db, prom, getDB) {
	var que = queue[name];

	if (!que) {
		que = [];
		queue[name] = que;
	}

	// 在queue中的方法，需要将 prom 返回
	// 所以在这里封装了一下
	que.push(function () {
		func(db, prom, getDB);
		return prom;
	});

	console.log('append', queue[name].length);

	startQueue(name);
}

function startQueue(name) {
	var que = queue[name];

	console.log('start', queue, '  isRunning:', que.isRunning);

	if (!que) {
		return;
	}

	if (que.isRunning) {
		return;
	}

	que.isRunning = true;

	var func = que.shift();

	if (!func) {
		return;
	}

	try {
		func().then(res => {
			if (que.length) {
				que.isRunning = false;
				startQueue(name);
			} else {
				console.log('===> remove ', name, queue);
				delete queue[name];
			}
		})
	} catch(e) {}
}

/**
 * post request
 *
 * req: {
 * 		dbname:, 				// default is common
 * 		context:, 				// function中用到的变量上下文
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
 * 		context:, 												// 上下文, 数组
 * 		function: '',											// 数据体
 * })
 */
function dbfunc(req) {

	var prom = new Prom();

	getDB(req.dbname || 'base').then(db => {

		var pre = '{';

		// 将上下文数据转为字符串
		if (req.context) {
			var str = '';
			req.context.forEach((c, i) => {
				str += 'var param' + (i + 1) + '=' + JSON.stringify(c) + ';';
			})

			pre += str;
		}

		// 得到没有 { 的 function body
		var funBody = pre + req.function.substr(req.function.indexOf('{') + 1);

		console.log(funBody);

		// create the function
		var fun = new Function('db', 'prom', 'getDB', funBody);

		// 加入队列
		if (req.queue) {
			appendQueue(req.queue, fun, db, prom, getDB);
		} else {
			try{

				// prom.resolve in the function
				var res = fun(db, prom, getDB);

			} catch(e) {

				prom.resolve(e.message);

			}
		}

	})

	return prom;

}

module.exports = dbfunc;
