
package com.example.ems.controller;

import com.example.ems.entity.Department;
import com.example.ems.entity.Designation;
import com.example.ems.service.DepartmentService;
import com.example.ems.repository.DesignationRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@CrossOrigin(origins = "http://localhost:4200")
public class DepartmentController {

    private final DepartmentService departmentService;
    private final DesignationRepository designationRepository;

    public DepartmentController(
            DepartmentService departmentService,
            DesignationRepository designationRepository) {
        this.departmentService = departmentService;
        this.designationRepository = designationRepository;
    }

    @GetMapping
    public List<Department> getAllDepartments(
            @RequestParam(required = false) Boolean active) {
        return departmentService.getAllDepartments(active);
    }

    // Fetch only the designations belonging to the selected department.
    @GetMapping("/{id}/designations")
    public List<Designation> getDesignationsByDepartment(
            @PathVariable Long id) {
        return designationRepository.findByDepartmentId(id);
    }

    @PostMapping
    public Department createDepartment(@RequestBody Department department) {
        return departmentService.createDepartment(department);
    }

    @PutMapping("/{id}")
    public Department updateDepartment(
            @PathVariable Long id,
            @RequestBody Department department) {
        return departmentService.updateDepartment(id, department);
    }

    @DeleteMapping("/{id}")
    public void deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
    }
}
