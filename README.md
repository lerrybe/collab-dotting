# collab-dotting

"collab-dotting" is an editor that enables collaborative creation of pixel art using dotting.

## Initial Setup for Collaborative Editing using yorkie

### 1. Enable collaborative editing locally with Envoy, Yorkie and MongoDB with docker

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

### 2. Install dependencies

You must install dependencies to run this repository.

```bash
$ yarn
```

### 3. Create .env file

This repository relies on .env file for environment variables. Copy the content of .env.example and create .env file in the root directory of this repository.

Your final .env file should look like this:

```bash
# .env
VITE_YORKIE_API_ADDR=http://localhost:8080
```

Afterwards, whenever you want to test dotting with collaborative editing, just simply open docker daemon and you are good to go.
