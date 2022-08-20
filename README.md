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

EXPOSE 3000

# run npm start to start the server
CMD npm start
```

```bash
# build
docker build -t image-name .

# run
docker run -p -d 3000:3000 image-name
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
            - '3000:3000'
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

