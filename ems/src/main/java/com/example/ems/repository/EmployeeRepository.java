
package com.example.ems.repository;

import com.example.ems.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends
        JpaRepository<Employee, Long>,
        JpaSpecificationExecutor<Employee> {

    List<Employee> findByDeletedFalse();

    Optional<Employee> findByIdAndDeletedFalse(Long id);

    boolean existsByEmployeeCode(String employeeCode);

    boolean existsByEmail(String email);
}
