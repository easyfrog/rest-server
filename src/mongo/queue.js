/**
 * 队列
 * @type {Object}
 * @example
 * {
 * 		queueName: [func1, func2, ...],
 * }
 */
var queue = {};

exports.appendQueue = (name, func, db, response) => {
	var que = queue[name];

	if (!que) {
		que = [];
		queue[name] = que;
	}

	// 在queue中的方法，需要将 prom 返回
	// 所以在这里封装了一下
	que.push(async function () {
		var result = await func(db);
		response.json(result)
	});

	console.log('append', queue[name].length, que);

	startQueue(name);
}

var startQueue = async name => {
	var que = queue[name];

	if (!que) {
		return;
	}

	if (que.isRunning) {
		return;
	}

	console.log('name', name, '  isRunning:', que.isRunning);

	que.isRunning = true;

	var funcObj = que.shift();

	if (!funcObj) {
		return;
	}

	// run function
	var res = await funcObj()


	if (que.length) {
		que.isRunning = false;
		startQueue(name);
	} else {
		console.log('===> remove ', name, queue);
		delete queue[name];
	}
}

exports.startQueue = startQueue