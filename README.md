# collab-dotting

"collab-dotting" is an editor that enables collaborative creation of pixel art using dotting.

## Initial Setup for Collaborative Editing using yorkie

### Enable collaborative editing locally with Envoy, Yorkie and MongoDB with docker

You must have docker installed in your machine beforehand.

[Install Docker](https://docs.docker.com/engine/install/) if you don't have it yet.

After installing docker, you must enable docker daemon in your machine. Open the Docker Desktop you've installed.

After the daemon is running, you can run the following command to check if docker is running properly.

```bash
$ docker ps -a
```

Start MongoDB, Yorkie and Envoy proxy in a terminal session (You only need to run this once)

```bash
$ docker-compose -f docker/docker-compose.yml up --build -d
```

Afterwards, whenever you want to test dotting with collaborative editing, just simply open docker daemon and you are good to go.
