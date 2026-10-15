# Employee Management System (EMS)

## 1. Project Overview
A full-stack Employee Management System for managing employee records using Angular, Spring Boot, and MySQL.

## 2. Technology Stack

| Technology | Version |
|---|---|
| Angular | 21.2.25 |
| Node.js | 20.19.6 |
| npm | 10.8.2 |
| Spring Boot | 3.5.6 |
| Java | 17 |
| Database | MySQL |

Note: Confirm the exact database server version on the machine used to run the application.

## 3. Project Structure
- `frontend/` — Angular frontend
- `ems/` — Spring Boot backend
- `backend/` — Additional backend-related folder
- `database/schema.sql` — Database schema
- `database/seed.sql` — Initial data
- `postman/EMS-API-Collection.json` — Postman API collection

## 4. Prerequisites
- JDK 17
- Node.js and npm
- Angular CLI
- MySQL-compatible database server
- Git

## 5. Database Setup
1. Start your database server.
2. Create a database named `employee_management`, if it does not already exist.
3. Run `database/schema.sql`.
4. Run `database/seed.sql`.
5. Check `ems/src/main/resources/application.properties` and configure the database username and password for your local setup.

Database URL: `jdbc:mysql://localhost:3306/employee_management`

Do not commit real database passwords or other secrets.

## 6. Run the Backend
From the project root, open a terminal and run:

```bash
cd ems
./mvnw spring-boot:run
```

If the Maven wrapper is unavailable, use `mvn spring-boot:run` if Maven is installed.

Backend URL: `http://localhost:8081`

## 7. Run the Frontend
Open a second terminal at the project root:

```bash
cd frontend
npm install
ng serve
```

Open `http://localhost:4200` if that is the URL shown in the terminal.

Keep both applications running while testing.

## 8. API Collection
Import `postman/EMS-API-Collection.json` into Postman. The configured base URL is `http://localhost:8081`.

Verify each endpoint and request body against the running backend before submission.

## 9. Features
- Employee CRUD operations
- Angular frontend connected to a Spring Boot REST API
- MySQL database integration
- Department and designation-related functionality

Verify the features in the running application before claiming they are fully functional.

## 10. Assumptions and Limitations
- The applications are run locally for development and demonstration.
- Backend port: `8081`.
- Frontend development server: normally `4200`.
- Database port: `3306`.
- Database credentials are configured locally.
- Any untested functionality should be treated as pending verification.

## 11. Screenshots and Demo
Add application screenshots to a `screenshots/` folder.

Record a 3–5 minute demonstration showing employee creation, viewing, editing, deletion, and dynamic UI updates. Add the shareable video link here after uploading it.

Demo video: https://drive.google.com/file/d/1PMyMSvihOsGtbmOD1bJC7HxsHUUJTciY/view?usp=sharing

