const expressWs = require('express-ws')
const utils = require('../utils/utils')

// 保存所有连接的socket
var clients = []

function send(ws, data) {
    try {
        ws.send(JSON.stringify(data))
    } catch (error) {
        console.error(error);
    }
}

module.exports = function (app) {
    
    // 初始化 express-ws
    expressWs(app)

    // websocket路由
    app.ws('/ws', (ws, req) => {

        // uuid
        ws.uuid = utils.getUUID()

        /** 
         * data : {
         *  type: '',
         *  message: ''
         * }
         */
        ws.on('message', data => {
            try {
                var json = JSON.parse(data)
                console.log('ws message: ', json)

                // echo
                send(ws, {
                    type: '',
                    uuid: ws.uuid,
                    message: data
                })
            } catch (error) {
                console.error(error);

                // 发回错误信息
                ws.send(JSON.stringify({
                    type: 'error',
                    ok: 0,
                    msg: error.message
                }))
            }
        })

    })
}