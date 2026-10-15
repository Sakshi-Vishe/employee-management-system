
package com.example.ems.service;

import com.example.ems.entity.Department;
import com.example.ems.repository.DepartmentRepository;
import com.example.ems.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    public DepartmentService(
            DepartmentRepository departmentRepository,
            EmployeeRepository employeeRepository) {
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
    }

    public List<Department> getAllDepartments(Boolean active) {
        if (active == null) {
            return departmentRepository.findAll();
        }
        return departmentRepository.findByActive(active);
    }

    public Department createDepartment(Department department) {
        return departmentRepository.save(department);
    }

    public Department updateDepartment(Long id, Department updatedDepartment) {
        Department existing = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        existing.setName(updatedDepartment.getName());
        existing.setCode(updatedDepartment.getCode());
        existing.setActive(updatedDepartment.isActive());

        return departmentRepository.save(existing);
    }

    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        boolean hasEmployees = employeeRepository.findByDeletedFalse()
                .stream()
                .anyMatch(employee -> employee.getDepartmentId().equals(id));

        if (hasEmployees) {
            throw new RuntimeException(
                    "Cannot delete this department because employees are assigned to it.");
        }

        departmentRepository.delete(department);
    }
}
