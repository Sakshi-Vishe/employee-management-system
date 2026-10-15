
package com.example.ems.controller;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.example.ems.repository.DepartmentRepository;
import com.example.ems.repository.EmployeeRepository;
import com.example.ems.entity.Employee;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    public DashboardController(
            EmployeeRepository employeeRepository,
            DepartmentRepository departmentRepository) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
    }

    @GetMapping("/stats")
    public Map<String, Long> getStats() {
        List<Employee> employees =
                employeeRepository.findByDeletedFalse();

        long totalEmployees = employees.size();

        long activeEmployees = employees.stream()
                .filter(Employee::isActive)
                .count();

        long totalDepartments =
                departmentRepository.count();

        long activeDepartments =
                departmentRepository.findByActive(true).size();

        Map<String, Long> stats = new HashMap<>();
        stats.put("totalEmployees", totalEmployees);
        stats.put("activeEmployees", activeEmployees);
        stats.put("totalDepartments", totalDepartments);
        stats.put("activeDepartments", activeDepartments);

        return stats;
    }
}
