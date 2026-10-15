
USE employee_management;

-- 1. Departments
INSERT INTO departments (code, name) VALUES
('IT', 'Information Technology'),
('HR', 'Human Resources'),
('FIN', 'Finance'),
('MKT', 'Marketing');

-- 2. Designations for each department
INSERT INTO designations (department_id, name)
SELECT id, 'Java Developer' FROM departments WHERE code = 'IT'
UNION ALL
SELECT id, 'Software Tester' FROM departments WHERE code = 'IT'
UNION ALL
SELECT id, 'System Analyst' FROM departments WHERE code = 'IT'
UNION ALL
SELECT id, 'HR Executive' FROM departments WHERE code = 'HR'
UNION ALL
SELECT id, 'Recruiter' FROM departments WHERE code = 'HR'
UNION ALL
SELECT id, 'HR Manager' FROM departments WHERE code = 'HR'
UNION ALL
SELECT id, 'Accountant' FROM departments WHERE code = 'FIN'
UNION ALL
SELECT id, 'Financial Analyst' FROM departments WHERE code = 'FIN'
UNION ALL
SELECT id, 'Payroll Specialist' FROM departments WHERE code = 'FIN'
UNION ALL
SELECT id, 'Marketing Executive' FROM departments WHERE code = 'MKT'
UNION ALL
SELECT id, 'SEO Specialist' FROM departments WHERE code = 'MKT'
UNION ALL
SELECT id, 'Marketing Manager' FROM departments WHERE code = 'MKT';

-- 3. Dropdown options
INSERT INTO lookup_values (category, code, label, sort_order) VALUES
('GENDER', 'MALE', 'Male', 1),
('GENDER', 'FEMALE', 'Female', 2),
('GENDER', 'OTHER', 'Other', 3),
('EMPLOYMENT_TYPE', 'PERMANENT', 'Permanent', 1),
('EMPLOYMENT_TYPE', 'CONTRACT', 'Contract', 2),
('EMPLOYMENT_TYPE', 'INTERN', 'Intern', 3);

-- 4. Employee form configuration
INSERT INTO form_fields
(form_name, field_key, label, field_type, is_required,
 validation_json, options_api, visible_when, display_order)
VALUES
('employee', 'employeeCode', 'Employee Code', 'text', TRUE,
 '{"readonly":true}', NULL, NULL, 1),
('employee', 'firstName', 'First Name', 'text', TRUE,
 '{"minLength":2,"maxLength":50,"pattern":"^[A-Za-z]+$"}', NULL, NULL, 2),
('employee', 'lastName', 'Last Name', 'text', TRUE,
 '{"minLength":1,"maxLength":50}', NULL, NULL, 3),
('employee', 'email', 'Email', 'email', TRUE,
 '{"unique":true}', NULL, NULL, 4),
('employee', 'mobile', 'Mobile Number', 'text', TRUE,
 '{"pattern":"^[0-9]{10}$"}', NULL, NULL, 5),
('employee', 'dateOfBirth', 'Date of Birth', 'date', TRUE,
 '{"minimumAge":18}', NULL, NULL, 6),
('employee', 'gender', 'Gender', 'dropdown', TRUE,
 NULL, '/api/lookups/GENDER', NULL, 7),
('employee', 'departmentId', 'Department', 'dropdown', TRUE,
 NULL, '/api/departments?active=true', NULL, 8),
('employee', 'designationId', 'Designation', 'dropdown', TRUE,
 NULL, NULL, 'departmentId', 9),
('employee', 'employmentType', 'Employment Type', 'dropdown', TRUE,
 NULL, '/api/lookups/EMPLOYMENT_TYPE', NULL, 10),
('employee', 'joiningDate', 'Joining Date', 'date', TRUE,
 '{"notFuture":true}', NULL, NULL, 11),
('employee', 'contractEndDate', 'Contract End Date', 'date', FALSE,
 '{"after":"joiningDate"}', NULL, 'employmentType:CONTRACT,INTERN', 12),
('employee', 'salary', 'Salary', 'number', TRUE,
 '{"min":0.01}', NULL, NULL, 13),
('employee', 'address', 'Address', 'textarea', FALSE,
 '{"maxLength":250}', NULL, NULL, 14),
('employee', 'status', 'Status', 'dropdown', TRUE,
 NULL, NULL, NULL, 15);

-- 5. Twenty-five sample employees
-- Codes and emails are unique. Department and designation IDs
-- are looked up by code/name instead of assuming fixed IDs.

INSERT INTO employees
(employee_code, first_name, last_name, email, mobile,
 date_of_birth, gender, department_id, designation_id,
 employment_type, contract_end_date, joining_date, salary, address)
SELECT
    s.employee_code, s.first_name, s.last_name, s.email, s.mobile,
    s.date_of_birth, s.gender, d.id, g.id,
    s.employment_type, s.contract_end_date, s.joining_date,
    s.salary, s.address
FROM (
    SELECT 'EMP0001' employee_code, 'Aarav' first_name, 'Shah' last_name,
    'aarav.shah@example.com' email, '9000000001' mobile,
    '1998-04-12' date_of_birth, 'Male' gender, 'IT' dept_code,
    'Java Developer' designation_name, 'PERMANENT' employment_type,
    NULL contract_end_date, '2023-06-12' joining_date,
    55000.00 salary, 'Mumbai' address

    UNION ALL SELECT 'EMP0002','Ananya','Patil','ananya.patil@example.com','9000000002','1999-08-21','Female','IT','Software Tester','PERMANENT',NULL,'2024-01-15',48000.00,'Thane'
    UNION ALL SELECT 'EMP0003','Rohan','Desai','rohan.desai@example.com','9000000003','1997-02-10','Male','IT','System Analyst','PERMANENT',NULL,'2022-09-01',65000.00,'Pune'
    UNION ALL SELECT 'EMP0004','Priya','Joshi','priya.joshi@example.com','9000000004','2000-11-05','Female','IT','Java Developer','CONTRACT','2027-12-31','2025-01-10',42000.00,'Navi Mumbai'
    UNION ALL SELECT 'EMP0005','Ishaan','Kulkarni','ishaan.kulkarni@example.com','9000000005','1996-06-18','Male','IT','Software Tester','PERMANENT',NULL,'2021-07-19',52000.00,'Nashik'
    UNION ALL SELECT 'EMP0006','Meera','Nair','meera.nair@example.com','9000000006','2001-03-25','Female','IT','Java Developer','INTERN','2027-06-30','2026-01-05',18000.00,'Kalyan'
    UNION ALL SELECT 'EMP0007','Kabir','Mehta','kabir.mehta@example.com','9000000007','1995-12-02','Male','HR','HR Executive','PERMANENT',NULL,'2020-04-13',45000.00,'Mumbai'
    UNION ALL SELECT 'EMP0008','Sneha','Rao','sneha.rao@example.com','9000000008','1998-07-14','Female','HR','Recruiter','PERMANENT',NULL,'2023-02-20',40000.00,'Thane'
    UNION ALL SELECT 'EMP0009','Aditya','More','aditya.more@example.com','9000000009','1994-09-09','Male','HR','HR Manager','PERMANENT',NULL,'2019-11-11',72000.00,'Pune'
    UNION ALL SELECT 'EMP0010','Ira','Deshmukh','ira.deshmukh@example.com','9000000010','2000-01-30','Female','HR','Recruiter','CONTRACT','2027-08-31','2025-08-01',35000.00,'Dombivli'
    UNION ALL SELECT 'EMP0011','Neil','Fernandes','neil.fernandes@example.com','9000000011','1997-05-16','Male','HR','HR Executive','PERMANENT',NULL,'2022-03-14',43000.00,'Mumbai'
    UNION ALL SELECT 'EMP0012','Kavya','Shinde','kavya.shinde@example.com','9000000012','2002-10-11','Female','HR','Recruiter','INTERN','2027-05-31','2026-02-02',16000.00,'Badlapur'
    UNION ALL SELECT 'EMP0013','Rahul','Bose','rahul.bose@example.com','9000000013','1996-04-22','Male','FIN','Accountant','PERMANENT',NULL,'2021-06-07',50000.00,'Navi Mumbai'
    UNION ALL SELECT 'EMP0014','Pooja','Kadam','pooja.kadam@example.com','9000000014','1999-12-19','Female','FIN','Financial Analyst','PERMANENT',NULL,'2023-10-09',58000.00,'Thane'
    UNION ALL SELECT 'EMP0015','Varun','Iyer','varun.iyer@example.com','9000000015','1993-03-08','Male','FIN','Payroll Specialist','PERMANENT',NULL,'2018-05-21',62000.00,'Mumbai'
    UNION ALL SELECT 'EMP0016','Riya','Mishra','riya.mishra@example.com','9000000016','2000-06-27','Female','FIN','Accountant','CONTRACT','2027-11-30','2025-04-15',39000.00,'Pune'
    UNION ALL SELECT 'EMP0017','Sahil','Jain','sahil.jain@example.com','9000000017','1998-02-14','Male','FIN','Financial Analyst','PERMANENT',NULL,'2022-08-22',56000.00,'Kalyan'
    UNION ALL SELECT 'EMP0018','Diya','Pillai','diya.pillai@example.com','9000000018','2001-09-03','Female','FIN','Accountant','INTERN','2027-09-30','2026-03-02',17000.00,'Mumbai'
    UNION ALL SELECT 'EMP0019','Arjun','Sane','arjun.sane@example.com','9000000019','1995-01-17','Male','MKT','Marketing Executive','PERMANENT',NULL,'2020-09-14',46000.00,'Thane'
    UNION ALL SELECT 'EMP0020','Nisha','Verma','nisha.verma@example.com','9000000020','1997-07-29','Female','MKT','SEO Specialist','PERMANENT',NULL,'2022-12-05',51000.00,'Navi Mumbai'
    UNION ALL SELECT 'EMP0021','Dev','Chavan','dev.chavan@example.com','9000000021','1992-11-23','Male','MKT','Marketing Manager','PERMANENT',NULL,'2018-02-12',75000.00,'Pune'
    UNION ALL SELECT 'EMP0022','Tara','Kapoor','tara.kapoor@example.com','9000000022','1999-05-06','Female','MKT','Marketing Executive','CONTRACT','2027-10-31','2025-06-16',37000.00,'Mumbai'
    UNION ALL SELECT 'EMP0023','Om','Pawar','om.pawar@example.com','9000000023','1996-08-31','Male','MKT','SEO Specialist','PERMANENT',NULL,'2021-01-18',49000.00,'Dombivli'
    UNION ALL SELECT 'EMP0024','Aisha','Khan','aisha.khan@example.com','9000000024','2002-04-04','Female','MKT','Marketing Executive','INTERN','2027-12-31','2026-04-06',17500.00,'Kalyan'
    UNION ALL SELECT 'EMP0025','Manav','Gokhale','manav.gokhale@example.com','9000000025','1998-10-20','Other','IT','System Analyst','PERMANENT',NULL,'2024-07-08',60000.00,'Mumbai'
) AS s
JOIN departments d ON d.code = s.dept_code
JOIN designations g
    ON g.department_id = d.id
    AND g.name = s.designation_name;
