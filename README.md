![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-000?style=for-the-badge&logo=apachekafka)
# USP MBA Final Paper

## **Table of Contents**
- [Overview](#overview)
- [Project Structure](#project-structure)
- [Setup](#setup)
    - [Prerequisites](#prerequisites)
    - [Build and run the services](#build-and-run-the-services)
- [API Endpoints](#api-endpoints)
- [Kafka Topics (Event-Driven Architecture)](#kafka-topics-event-driven-architecture)
    - [Kafka UI](#kafka-ui)

## Overview
This project aims to compare the performance of microservices and event-driven architectures in the context of a simple e-commerce application. It uses Node.js, Express, MongoDB, Kafka, and Docker to simulate an e-commerce system with product, order, and user services.

## Project Structure
- `./microservices-project`: Contains the implementation using a microservices architecture.
- `./event-driven-project`: Contains the implementation using an event-driven architecture with Kafka.

## Setup
### Prerequisites
- Docker
- Docker Compose

### Build and run the services
1. Microservices
```bash
cd microservices-project
docker-compose up --build
```

2. Event-driven:
```bash
cd event-driven-project
docker-compose up --build
```

## API Endpoints
1. Product Service (http://localhost:3001)
    - `GET /products`: List all products
    - `GET /products/:id`: Get product details by ID
    - `POST /products`: Create a new product
    - `PUT /products/:id`: Update a product
    - `DELETE /products/:id`: Delete a product

2. Order Service (http://localhost:3002)
    - `GET /orders`: List all orders
    - `GET /orders/:id`: Get order details by ID
    - `POST /orders`: Create a new order
    - `PUT /orders/:id`: Update an order (e.g., change status)
    - `DELETE /orders/:id`: Delete an order

3. User Service (http://localhost:3003)
    - `GET /users`: List all users
    - `GET /users/:id`: Get user details by ID
    - `POST /users`: Create a new user
    - `PUT /users/:id`: Update a user
    - `DELETE /users/:id`: Delete a user

```mermaid
graph LR
subgraph Services
  ProductService["Product Service<br />(port 3001)"] -- CRUD --> MongoDB[(MongoDB)]
  OrderService["Order Service<br />(port 3002)"] -- CRUD --> MongoDB
  UserService["User Service<br />(port 3003)"] -- CRUD --> MongoDB
end

subgraph Kafka Cluster
  Kafka["Kafka"]
  ProductEvents["product-events"]
  OrderEvents["order-events"]
  UserEvents["user-events"]

  Kafka --> ProductEvents
  Kafka --> OrderEvents
  Kafka --> UserEvents
end

OrderService --> ProductEvents
OrderService --> UserEvents

KafkaUI["Kafka UI<br />(port 8080)"] --> Kafka
```

## Kafka Topics (Event-Driven Architecture)
- `product-events`: Events related to product creation, update, and deletion.
- `order-events`: Events related to order creation, update, and deletion.
- `user-events`: Events related to user creation, update, and deletion.

### Kafka UI
The `docker-compose.yml` file includes a Kafka UI to visualize and manage Kafka topics and events. Access it at http://localhost:8080.
