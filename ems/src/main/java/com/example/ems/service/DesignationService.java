
package com.example.ems.service;

import com.example.ems.entity.Designation;
import com.example.ems.repository.DesignationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DesignationService {

    private final DesignationRepository designationRepository;

    public DesignationService(
            DesignationRepository designationRepository) {
        this.designationRepository = designationRepository;
    }

    // Get all designations
    public List<Designation> getAllDesignations() {
        return designationRepository.findAll();
    }

    // Get designations by department
    public List<Designation> getDesignationsByDepartment(
            Long departmentId) {
        return designationRepository.findByDepartmentId(departmentId);
    }

    // Add designation
    public Designation createDesignation(Designation designation) {
        validateDesignation(designation);

        boolean duplicate =
                designationRepository
                        .existsByDepartmentIdAndNameIgnoreCase(
                                designation.getDepartmentId(),
                                designation.getName().trim());

        if (duplicate) {
            throw new RuntimeException(
                    "This designation already exists in the department.");
        }

        designation.setId(null);
        designation.setName(designation.getName().trim());

        return designationRepository.save(designation);
    }

    // Update designation
    public Designation updateDesignation(
            Long id, Designation updatedDesignation) {

        Designation existing = designationRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Designation not found."));

        validateDesignation(updatedDesignation);

        boolean duplicate =
                designationRepository
                        .existsByDepartmentIdAndNameIgnoreCase(
                                updatedDesignation.getDepartmentId(),
                                updatedDesignation.getName().trim());

        boolean sameRecord =
                existing.getDepartmentId().equals(
                        updatedDesignation.getDepartmentId())
                && existing.getName().equalsIgnoreCase(
                        updatedDesignation.getName().trim());

        if (duplicate && !sameRecord) {
            throw new RuntimeException(
                    "This designation already exists in the department.");
        }

        existing.setName(updatedDesignation.getName().trim());
        existing.setDepartmentId(updatedDesignation.getDepartmentId());

        return designationRepository.save(existing);
    }

    // Delete designation
    public void deleteDesignation(Long id) {
        Designation existing = designationRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Designation not found."));

        designationRepository.delete(existing);
    }

    // Validate designation fields
    private void validateDesignation(Designation designation) {
        if (designation.getName() == null
                || designation.getName().trim().isEmpty()) {
            throw new RuntimeException(
                    "Designation name is required.");
        }

        if (designation.getDepartmentId() == null) {
            throw new RuntimeException(
                    "Please select a department.");
        }
    }
}

