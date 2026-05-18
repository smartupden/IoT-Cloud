# IoT Cloud

IoT Cloud is a web platform for creating and managing IoT applications and Node-RED based runtime instances. The repository contains an Express/MongoDB backend, a React frontend, and a production build that can be served by the backend.

## Repository Structure

```text
.
|-- index.js                  # Express backend entrypoint
|-- package.json              # Backend dependencies and scripts
|-- src/
|   |-- Admin/                # Admin auth and user-management handlers
|   |-- Controllers/          # API request handlers
|   |-- Middleware/           # Auth, upload, logging, automation helpers
|   |-- Models/               # Mongoose models
|   |-- Routes/routes.js      # Backend API routes
|   `-- Services/             # Auth/profile service helpers
|-- app/                      # React frontend source
|-- build/                    # Built frontend served by Express
`-- upload/                   # Uploaded profile/application images
```

## Main Features

- User registration, login, JWT-based authentication, logout, and profile editing.
- Admin registration/login and admin-only user profile views.
- Application management for authenticated users.
- IoT instance management linked to applications.
- Template listing for available Node-RED dashboard templates.
- Activity logging for user actions.
- File upload support through `multer`.
- Integration with the automation service in `smartupden/Iot-containers` to create, start, stop, and delete container-backed Node-RED instances.

## Architecture

IoT Cloud is the control plane. It stores users, applications, templates, and instances in MongoDB. When a user creates an instance, the backend calls the automation API configured in `AUTOMATION_URL`. The automation API creates Docker Compose files and runtime assets for Node-RED and Mosquitto.

```text
React frontend
    |
    | HTTP API
    v
Express backend
    |
    | Mongoose
    v
MongoDB
    |
    | axios calls
    v
Iot-containers automation API
    |
    | Docker Compose
    v
Node-RED + Mosquitto instances
```

## Backend Setup

Install backend dependencies:

```bash
npm install
```

Create a `.env` file in the repository root:

```env
PORT=2000
MONGODB_URL=mongodb://localhost:27017/iot-cloud
AUTOMATION_URL=http://localhost:1000
AUTOMATION_IP=http://localhost
```

Start the backend:

```bash
npm run dev
```

The backend serves the built frontend from `build/` and exposes the API routes from `src/Routes/routes.js`.

## Frontend Setup

The React app lives in `app/`.

```bash
cd app
npm install
npm start
```

The frontend API base URL is configured in:

```text
app/src/config.js
```

By default it points to:

```js
http://localhost:2000
```

To create a production build:

```bash
cd app
npm run build
```

Copy or deploy the generated frontend build so the Express backend can serve it from `build/`.

## Environment Variables

| Variable | Used By | Description |
| --- | --- | --- |
| `PORT` | Backend | Express server port. |
| `MONGODB_URL` | Backend | MongoDB connection string. |
| `AUTOMATION_URL` | Backend | Base URL for the `Iot-containers` automation service. |
| `AUTOMATION_IP` | Backend | Public host/IP used when saving Node-RED, dashboard, MQTT, and WebSocket URLs. |

## API Overview

### Authentication and Users

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/register` | No | Register a user. |
| `POST` | `/client` | No | Register/add a client user. |
| `POST` | `/login` | No | Log in by email or username. |
| `POST` | `/loginverify` | User token | Verify a user token. |
| `GET` | `/getprofile` | User token | Get the authenticated user profile. |
| `PUT` | `/editprofile` | User token | Update profile data. |
| `POST` | `/logout` | No | Log out. |
| `GET` | `/users` | Admin | List users. |
| `GET` | `/users/:id` | User token | Get one user. |
| `PUT` | `/users/:id` | User token | Edit one user. |

### Admin

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/adminregister` | No | Register an admin. |
| `POST` | `/adminlogincreate` | No | Admin login. |
| `GET` | `/viewallprofile` | Admin token | View all user profiles. |
| `GET` | `/viewpublicprofile` | No | View public profiles. |

### Applications

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/application` | User token | Create an application and default instance. |
| `GET` | `/application` | User token | List applications for the user. |
| `PUT` | `/application/status/:id` | User token | Change application status and related instance statuses. |
| `PUT` | `/application/:id` | User token | Edit an application. |
| `DELETE` | `/application/:id` | User token | Delete an application and its instances. |

### Instances

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/instance` | User token | Create an IoT instance through the automation service. |
| `GET` | `/instance` | User token | List instances, optionally filtered with `?appId=...`. |
| `GET` | `/instance/:id` | User token | Get a single instance. |
| `PUT` | `/instance/status/:id` | User token | Start or stop an instance through the automation service. |
| `DELETE` | `/instance/:id` | User token | Delete an instance through the automation service. |

### Templates and Uploads

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/templates` | No | List available templates from MongoDB. |
| `POST` | `/imageupload` | No | Upload an image using form field `images`. |

## Data Models

- `Users`: stores account information, role, purpose, and optional client instance data.
- `Applications`: stores named applications, owner, status, activity logs, and related instances.
- `Instances`: stores runtime instance metadata such as URL, dashboard URL, MQTT port, WebSocket port, status, template, and service name.
- `templates`: stores available Node-RED template names.
- `ActivityLogs`: stores user activity messages linked to users and applications.

## Instance Lifecycle

1. A user creates an application or instance in IoT Cloud.
2. IoT Cloud sends `POST /instance` to the automation service.
3. The automation service creates Docker Compose, Dockerfile, Mosquitto config, and Node-RED flow files.
4. IoT Cloud stores the returned ports and service metadata in MongoDB.
5. Starting or stopping an instance calls the automation service start/stop endpoints.
6. Deleting an instance calls the automation service delete endpoint and removes the MongoDB record.

## Notes

- The backend currently signs JWTs using the literal secret string `secret`; use an environment variable before production deployment.
- The app limits users to a maximum of two running instances at a time.
- The automation service must be running before instance creation/start/stop/delete workflows can work.
- MongoDB must contain template records that match the flow template names used by the automation service, such as `default`, `drone`, `ev`, `nano_grid`, and `smart_home`.
