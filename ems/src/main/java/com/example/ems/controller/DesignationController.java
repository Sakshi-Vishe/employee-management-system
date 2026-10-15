
package com.example.ems.controller;

import com.example.ems.entity.Designation;
import com.example.ems.service.DesignationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/designations")
@CrossOrigin(origins = "http://localhost:4200")
public class DesignationController {

    private final DesignationService designationService;

    public DesignationController(
            DesignationService designationService) {
        this.designationService = designationService;
    }

    // Get all designations or filter by department
    @GetMapping
    public List<Designation> getAllDesignations(
            @RequestParam(required = false) Long departmentId) {

        if (departmentId != null) {
            return designationService
                    .getDesignationsByDepartment(departmentId);
        }

        return designationService.getAllDesignations();
    }

    // Add designation
    @PostMapping
    public Designation createDesignation(
            @RequestBody Designation designation) {
        return designationService.createDesignation(designation);
    }

    // Update designation
    @PutMapping("/{id}")
    public Designation updateDesignation(
            @PathVariable Long id,
            @RequestBody Designation designation) {
        return designationService.updateDesignation(id, designation);
    }

    // Delete designation
    @DeleteMapping("/{id}")
    public void deleteDesignation(@PathVariable Long id) {
        designationService.deleteDesignation(id);
    }
}
