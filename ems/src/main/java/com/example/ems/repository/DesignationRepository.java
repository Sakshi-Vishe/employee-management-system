
package com.example.ems.repository;

import com.example.ems.entity.Designation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DesignationRepository
        extends JpaRepository<Designation, Long> {

    // Find designations belonging to a department
    List<Designation> findByDepartmentId(Long departmentId);

    // Check whether a designation name already exists in a department
    boolean existsByDepartmentIdAndNameIgnoreCase(
            Long departmentId, String name);
}
