/////////////////////////////////
// very simple Promise 
/////////////////////////////////
class Promise {
	constructor() {
		this.callbacks = [];
		this.alldone = null;
	}

	delay(time) {
		var p = new this.constructor();
		setTimeout(function () {
			p.resolve();
		}, time);
		return p;
	}

	then(cb) {
		this.callbacks.push(cb);
		return this;
	}

	resolve(param) {
		var s = this;
		var lastRes = null;
		var hasNext = false;
		setTimeout(() => {

			if (!s.callbacks.length) {
				if (s.alldone) {
					s.alldone(lastRes || param);
				}
				return;
			}

			for (var i = 0; i < s.callbacks.length; i++) {

				// invoke callback
				var tmp = s.callbacks[i](lastRes || param);

				if (tmp instanceof s.constructor) {
					hasNext = true;
					for (i ++; i < s.callbacks.length; i++) {
						tmp.then(s.callbacks[i]);
					}

					if (s.alldone) {
						tmp.alldone = s.alldone;
					}

					lastRes = null;
				} else {
					lastRes = tmp;
				}

				// lastRes = tmp;
			}

			if (!hasNext) {
				if (s.alldone) {
					s.alldone(lastRes || param);
					s.alldone = null;
				}
			}

		}, 0)
	}
}

Promise.empty = function (params) {
	var p = new Promise();
	setTimeout(function () {
		p.resolve(params);
	}, 0);
	return p;
}

Promise.delay = function (time) {
	var p = new Promise();
	setTimeout(function () {
		p.resolve();	
	}, time)
	return p;
}

/**
 * 处理一个数据的 Promise，在全部执行完成之后调用回调
 */
Promise.all = function (arr) {
	var prom = new Promise();

	var finishCount = 0;
	var results = [];

	function finish(res) {
		finishCount ++;

		results.push(res);

		if (finishCount === arr.length) {
			prom.resolve(results);
		}
	}

	arr.forEach(a => {
		a.alldone = finish;
	})

	return prom;
}

module.exports = Promise;

