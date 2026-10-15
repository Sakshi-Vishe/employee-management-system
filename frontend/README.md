# Employee Management System (EMS)

## 1. Project Overview

The Employee Management System (EMS) is a full-stack application for managing employee records. It uses an Angular frontend, a Spring Boot REST API backend, and a MySQL-compatible database.

## 2. Technology Stack

| Technology | Version |
|---|---|
| Frontend | Angular 21.2.25 |
| Node.js | 20.19.6 |
| npm | 10.8.2 |
| Backend | Spring Boot 3.5.6 |
| Java | 17 |
| Database | MySQL-compatible database |
| API communication | REST APIs using JSON |

**Database version:** Confirm the version of the database instance used to run this project before submitting.

## 3. Project Structure

- `frontend/` — Angular frontend application
- `ems/` — Spring Boot backend application
- `backend/` — Additional backend-related project folder
- `database/schema.sql` — Database schema script
- `database/seed.sql` — Initial/sample data script
- `postman/EMS-API-Collection.json` — Postman API collection

## 4. Prerequisites

Install the following before running the project:

- Java Development Kit (JDK) 17
- Node.js 20.19.6 and npm 10.8.2
- Angular CLI compatible with Angular 21
- MySQL-compatible database server
- Git

## 5. Database Setup

1. Start your MySQL-compatible database server.
2. Open MySQL Workbench or another MySQL client.
3. Create the database named `employee_management` if it does not already exist.
4. Run `database/schema.sql`.
5. Run `database/seed.sql` to insert the initial data.
6. Check the database connection settings in `ems/src/main/resources/application.properties`.

The configured database URL is:

`jdbc:mysql://localhost:3306/employee_management`

Ensure that the configured username and password match your local database installation. Do not commit real passwords or other secrets to GitHub.

## 6. Start the Backend

Open a terminal at the project root and run:

```bash
cd ems
./mvnw spring-boot:run
```

If the Maven wrapper is unavailable, use Maven installed on your system:

```bash
mvn spring-boot:run
```

The configured backend port is `8081`.

Backend base URL: `http://localhost:8081`

## 7. Start the Frontend

Open a **second terminal** at the project root and run:

```bash
cd frontend
npm install
ng serve
```

Open the local frontend URL displayed in the terminal, typically:

`http://localhost:4200`

Keep both the frontend and backend running while using the application.

## 8. API Documentation

The Postman collection is available at:

`postman/EMS-API-Collection.json`

Import this file into Postman to review and test the API requests. The configured base URL is `http://localhost:8081`.

API requests should be tested against the running backend and database. Update request bodies and endpoint paths in the collection if required by the actual controller mappings.

## 9. Features

The project is intended to support:

- Employee record creation
- Viewing employee records
- Updating employee records
- Deleting employee records
- Frontend and backend communication through REST APIs
- Database-backed employee information
- Department and designation-related data

Verify each feature against the running application before marking it as complete.

## 10. Assumptions and Limitations

- The application runs locally during development.
- The backend uses port `8081`.
- The frontend uses the Angular development server, normally on port `4200`.
- The database server is accessible locally on port `3306`.
- Database credentials are configured locally and are not included in this README.
- Features that have not been tested end to end should be treated as pending verification.
## 11. Screenshots and Demonstration

### Application Screenshots

Application screenshots are available in the `screenshots/` folder.

### Demo Video

[Watch the Employee Management System Demo](https://drive.google.com/file/d/1PMyMSvihOsGtbmOD1bJC7HxsHUUJTciY/view?usp=sharing)

The demonstration video covers the following functionalities:
- Creating a new employee
- Viewing employee details
- Editing employee information
- Deleting an employee
- Demonstrating the application's data-driven UI