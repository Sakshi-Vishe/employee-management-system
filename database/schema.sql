
CREATE DATABASE IF NOT EXISTS employee_management;
USE employee_management;

CREATE TABLE departments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE designations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    department_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    CONSTRAINT fk_designations_department
        FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT uq_department_designation
        UNIQUE (department_id, name)
);

CREATE TABLE lookup_values (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    category VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL,
    label VARCHAR(100) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    CONSTRAINT uq_lookup_category_code
        UNIQUE (category, code)
);

CREATE TABLE employees (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_code VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    mobile VARCHAR(10) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20),
    department_id BIGINT NOT NULL,
    designation_id BIGINT NOT NULL,
    employment_type VARCHAR(20) NOT NULL,
    contract_end_date DATE,
    joining_date DATE NOT NULL,
    salary DECIMAL(12,2) NOT NULL,
    address VARCHAR(250),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT fk_employee_department
        FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT fk_employee_designation
        FOREIGN KEY (designation_id) REFERENCES designations(id),
    CONSTRAINT chk_employee_salary CHECK (salary > 0)
);

CREATE TABLE form_fields (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    form_name VARCHAR(50) NOT NULL,
    field_key VARCHAR(50) NOT NULL,
    label VARCHAR(100) NOT NULL,
    field_type VARCHAR(20) NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    validation_json TEXT,
    options_api VARCHAR(200),
    visible_when TEXT,
    display_order INT NOT NULL,
    CONSTRAINT uq_form_field UNIQUE (form_name, field_key)
);
