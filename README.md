## RESTful server build & run width Dockerfile

在`rest-server`根目录下创建`Dockerfile`文件

```Dockerfile
FROM node:lts-alpine
WORKDIR /usr/src/app

# install pm2
RUN npm install pm2 -g

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3002

# run npm start to start the server
CMD npm start
```

```bash
# build
# 单独生成 rest-server image
docker build -t rest-server_app .

# run
docker run -d -p 3000:3000 image-name
```

## use `docker-compose` to manager multiple containers

needs `docker-compose.yml` file

```yml
version: '3'

services:
    app:
        container_name: rest-server
        build: .
        restart: always
        ports:
            - '3002:3002'
        volumes:
            - .:/usr/src/app
        depends_on:
            - mongo
    mongo:
        container_name: mongo
        image: mongo
        ports:
            - 27017:27017
        volumes:
            - data:/data/db

volumes:
    data:
```

```bash
# 生成所有的images
docker-compose build

# start
docker-compose up -d

# stop
docker-compose down
```

## 本机->服务器的部署

将本机上所有的images打包成一个.tar文件

```bash
docker save $(docker images --format '{{.Repository}}:{{.Tag}}') -o allinone.tar
```

将生成的`allinone.tar`拷贝到服务器上, 并进行加载

```base
docker load < allinone.tar
```

**开启服务**

创建`docker-compose.yml`文件去组织所有镜像的启动, 内容如下, 与本地相比, 主要修改两处地方:

可以直接使用`docker-compose-deploy.yml`文件*(记得去掉`-deploy`)*

1. 将`build: .`修改为`image: rest-server_app`, 表示不需要重新`build`了, 可以直接使用已经加载后的镜像
2. 将`app`中的`volumes`修改为`- .:/app`

```yml
version: '3'

services:
    app:
        container_name: rest-server
        image: rest-server_app
        restart: always
        ports:
            - '3000:3000'
        volumes:
            - .:/app
        depends_on:
            - mongo
    mongo:
        container_name: mongo
        image: mongo
        ports:
            - 27017:27017
        volumes:
            - data:/data/db

volumes:
    data:
```

### 在客户端引用 `run_func_client.js`

在客户端, 使用这个库文件来进行与服务器之间的请求, 类似`severless`的客户端SDK, 可以操作数据库,处理文件上传等

```js
import func from 'run_func_client'

// 初始化, 默认值: 'http://localhost:3002'
func.init({server: ''})

// 服务端执行, 处理数据库(MongoDB)
func.run(async db => {
    var res = await db.collection('users').find({}, {projection: {_id: 0}).toArray()
    return res
}).then()

// 文件上传, 支持多文件上传, files: fileList.files
func.upload(files).then()
```

### Linux 常用命

```base
# 查看端口号
lsof -i tcp:3000

# 杀掉指定端口的进程
kill -9 pid

# centOS 启动 docker
sudo systemctl start docker
sudo systemctl stop docker
```