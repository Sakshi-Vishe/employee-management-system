
package com.example.ems.service;

import com.example.ems.entity.Employee;
import com.example.ems.entity.Designation;
import com.example.ems.repository.EmployeeRepository;
import com.example.ems.repository.DesignationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DesignationRepository designationRepository;

    public EmployeeService(
            EmployeeRepository employeeRepository,
            DesignationRepository designationRepository) {
        this.employeeRepository = employeeRepository;
        this.designationRepository = designationRepository;
    }

    @Transactional(readOnly = true)
    public List<Employee> getAllEmployees() {
        return employeeRepository.findByDeletedFalse();
    }

    @Transactional(readOnly = true)
    public Employee getEmployee(Long id) {
        return employeeRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Employee not found: " + id));
    }

    public Employee createEmployee(Employee employee) {
        employee.setId(null);
        employee.setDeleted(false);

        normalizeEmployee(employee);
        validateEmployee(employee);
        validateDepartmentDesignation(employee);
        checkDuplicates(employee, null);

        return employeeRepository.save(employee);
    }


public Employee updateEmployee(Long id, Employee updatedEmployee) {
    // Reject a missing gender before changing or saving anything.
    if (updatedEmployee.getGender() == null
            || updatedEmployee.getGender().isBlank()
            || updatedEmployee.getGender().trim()
                    .equalsIgnoreCase("Select Gender")) {
        throw new IllegalArgumentException(
                "Gender is required. Please select a gender.");
    }

    Employee existing = getEmployee(id);

    if (hasText(updatedEmployee.getEmployeeCode())) {
        existing.setEmployeeCode(updatedEmployee.getEmployeeCode().trim());
    }

    if (hasText(updatedEmployee.getFirstName())) {
        existing.setFirstName(updatedEmployee.getFirstName().trim());
    }

    if (hasText(updatedEmployee.getLastName())) {
        existing.setLastName(updatedEmployee.getLastName().trim());
    }

    if (hasText(updatedEmployee.getEmail())) {
        existing.setEmail(
                updatedEmployee.getEmail().trim().toLowerCase(Locale.ROOT));
    }

    if (updatedEmployee.getPhone() != null) {
        existing.setPhone(updatedEmployee.getPhone().trim());
    }

    if (updatedEmployee.getDateOfBirth() != null) {
        existing.setDateOfBirth(updatedEmployee.getDateOfBirth());
    }

    existing.setGender(updatedEmployee.getGender().trim());

    if (updatedEmployee.getDepartmentId() != null) {
        existing.setDepartmentId(updatedEmployee.getDepartmentId());
    }

    if (updatedEmployee.getDesignationId() != null) {
        existing.setDesignationId(updatedEmployee.getDesignationId());
    }

    if (updatedEmployee.getEmploymentType() != null
            && !updatedEmployee.getEmploymentType().isBlank()) {
        existing.setEmploymentType(updatedEmployee.getEmploymentType().trim());
    }

    existing.setContractEndDate(updatedEmployee.getContractEndDate());

    if (updatedEmployee.getJoiningDate() != null) {
        existing.setJoiningDate(updatedEmployee.getJoiningDate());
    }

    if (updatedEmployee.getSalary() != null) {
        existing.setSalary(updatedEmployee.getSalary());
    }

    if (updatedEmployee.getAddress() != null) {
        existing.setAddress(updatedEmployee.getAddress().trim());
    }

    existing.setActive(updatedEmployee.isActive());

    normalizeEmployee(existing);
    validateEmployee(existing);
    validateDepartmentDesignation(existing);
    checkDuplicates(existing, id);

    return employeeRepository.save(existing);
}


    public void deleteEmployee(Long id) {
        Employee employee = getEmployee(id);
        employee.setDeleted(true);
        employeeRepository.save(employee);
    }

    private void validateDepartmentDesignation(Employee employee) {
        Long departmentId = employee.getDepartmentId();
        Long designationId = employee.getDesignationId();

        if (designationId == null) {
            return;
        }

        if (departmentId == null) {
            throw new IllegalArgumentException(
                    "Select a department before assigning a designation.");
        }

        Designation designation = designationRepository.findById(designationId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Designation not found."));

        if (!departmentId.equals(designation.getDepartmentId())) {
            throw new IllegalArgumentException(
                    "The selected designation does not belong to the selected department.");
        }
    }

    private void normalizeEmployee(Employee employee) {
        if (employee.getEmployeeCode() != null) {
            employee.setEmployeeCode(employee.getEmployeeCode().trim());
        }

        if (employee.getFirstName() != null) {
            employee.setFirstName(employee.getFirstName().trim());
        }

        if (employee.getLastName() != null) {
            employee.setLastName(employee.getLastName().trim());
        }

        if (employee.getEmail() != null) {
            employee.setEmail(
                    employee.getEmail().trim().toLowerCase(Locale.ROOT));
        }

        if (employee.getPhone() != null) {
            employee.setPhone(employee.getPhone().trim());
        }
    }

    private void validateEmployee(Employee employee) {
        if (!hasText(employee.getEmployeeCode())) {
            throw new IllegalArgumentException("Employee code is required.");
        }

        if (!hasText(employee.getFirstName())) {
            throw new IllegalArgumentException("First name is required.");
        }

        if (!hasText(employee.getLastName())) {
            throw new IllegalArgumentException("Last name is required.");
        }

        if (!hasText(employee.getEmail())
                || !employee.getEmail().matches(
                        "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new IllegalArgumentException(
                    "Please enter a valid email address.");
        }

        if (!hasText(employee.getPhone())
                || !employee.getPhone().matches("[0-9]{10}")) {
            throw new IllegalArgumentException(
                    "Mobile number must contain exactly 10 digits.");
        }

        if (employee.getDateOfBirth() == null) {
            throw new IllegalArgumentException("Date of birth is required.");
        }

        if (employee.getJoiningDate() == null) {
            throw new IllegalArgumentException("Joining date is required.");
        }

        if (employee.getSalary() != null
                && employee.getSalary().signum() < 0) {
            throw new IllegalArgumentException("Salary cannot be negative.");
        }

        if (employee.getDateOfBirth().isAfter(employee.getJoiningDate())) {
            throw new IllegalArgumentException(
                    "Date of birth must be before the joining date.");
        }

        String type = employee.getEmploymentType();

        if (type != null
                && (type.equalsIgnoreCase("CONTRACT")
                    || type.equalsIgnoreCase("INTERN"))) {

            if (employee.getContractEndDate() == null) {
                throw new IllegalArgumentException(
                        "Contract end date is required for Contract or Intern employees.");
            }

            if (!employee.getContractEndDate()
                    .isAfter(employee.getJoiningDate())) {
                throw new IllegalArgumentException(
                        "Contract end date must be after the joining date.");
            }
        }
    }

    private void checkDuplicates(Employee employee, Long currentId) {
        boolean duplicateCode = employeeRepository.findByDeletedFalse()
                .stream()
                .anyMatch(existing ->
                        !existing.getId().equals(currentId)
                        && existing.getEmployeeCode() != null
                        && existing.getEmployeeCode().equalsIgnoreCase(
                                employee.getEmployeeCode()));

        if (duplicateCode) {
            throw new IllegalArgumentException(
                    "Employee code already exists. Please use a different code.");
        }

        boolean duplicateEmail = employeeRepository.findByDeletedFalse()
                .stream()
                .anyMatch(existing ->
                        !existing.getId().equals(currentId)
                        && existing.getEmail() != null
                        && existing.getEmail().equalsIgnoreCase(
                                employee.getEmail()));

        if (duplicateEmail) {
            throw new IllegalArgumentException(
                    "Email already exists. Please use a different email address.");
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
