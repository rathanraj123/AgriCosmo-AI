# AgriCosmo AI Platform

AgriCosmo AI is a modern, full-stack platform designed to help farmers and agricultural specialists by providing AI-driven insights, marketplace integrations, diagnostic health scans for crops, and community features.

## 🏗 Architecture & Tech Stack

The platform is designed using a microservices-inspired monolithic architecture, highly optimized for Docker deployments.

- **Frontend:** React + Vite, TypeScript, Tailwind CSS
- **Backend:** FastAPI (Python 3.10), Uvicorn/Gunicorn
- **Database:** PostgreSQL 15 (Relational Data)
- **Caching & Brokers:** Redis 7 (Celery Message Broker & Caching)
- **Background Workers:** Celery (Asynchronous Tasks)
- **Containerization:** Docker & Docker Compose

### System Diagram

```text
       +--------------------+          +--------------------+
       |                    |          |                    |
       |  Frontend (React)  +--------->+  Backend API       |
       |  Port: 3000        |   Rest   |  (FastAPI)         |
       |                    |   API    |  Port: 8000        |
       +--------------------+          +---------+----------+
                                                 |               
                                                 |               
                      +--------------------------+-------------------------+
                      |                          |                         |
            +---------v----------+     +---------v----------+    +---------v----------+
            |                    |     |                    |    |                    |
            |  PostgreSQL (DB)   |     |    Redis Broker    |    |  Celery Workers    |
            |  Port: 5432        +<---->  Port: 6379        +<---+  (Background Jobs) |
            |                    |     |                    |    |                    |
            +--------------------+     +--------------------+    +--------------------+
```

## 🚀 Quick Start (Dockerized)

The absolute easiest way to run the platform on any machine is using Docker Compose. Make sure you have [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/) installed.

### 1. Environment Setup

At the root of the repository, ensure you have an `.env` file. You can create one by duplicating a sample or using the provided variables.

```bash
# Recommended default variables for local dev
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres_password_123!
POSTGRES_DB=agricosmo
```

### 2. Run the Application

Execute the following command in the root of the project to build and start all five containers (Frontend, Backend, Celery, Database, Redis):

```bash
docker-compose up --build
```
*(Use the `-d` flag if you want to run it in disconnected/background mode: `docker-compose up --build -d`)*

### 3. Access Services

Once the terminal outputs that the containers are healthy and running, open your browser:

- **Web Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend Swagger API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

## 🛑 Stopping the Application

To cleanly stop all services and their networks:

```bash
docker-compose down
```

*(Note: Data stored in the Database will persist thanks to Docker named volumes. To completely wipe the database locally, run `docker-compose down -v`)*

## 🛠 Troubleshooting

1. **Ports Already in Use:** If you see an error about port `5432`, `8000`, or `3000` already being allocated, ensure you don't have local instances of Postgres, Redis, or other web servers running outside of Docker.
2. **Database Authentication Errors:** If you change your `POSTGRES_PASSWORD` in the `.env` file *after* running the containers for the first time, Docker won't automatically update the existing named volume. You will need to wipe the volume using `docker-compose down -v` and restart.
3. **Frontend Not Updating:** If you make changes to the React source code and they do not reflect, run `docker-compose build frontend` followed by `docker-compose up -d frontend` to rebuild and recreate simply the single container.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---
*Built tightly for agriculture optimization and modern web performance.*
