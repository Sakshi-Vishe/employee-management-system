
package com.example.ems.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lookups")
@CrossOrigin(origins = "http://localhost:4200")
public class LookupController {

    private final JdbcTemplate jdbcTemplate;

    public LookupController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/{category}")
    public List<Map<String, Object>> getLookupValues(
            @PathVariable String category) {

        if (!category.equals("GENDER")
                && !category.equals("EMPLOYMENT_TYPE")) {
            throw new IllegalArgumentException(
                    "Invalid lookup category");
        }

        return jdbcTemplate.queryForList(
                "SELECT * FROM lookup_values WHERE category = ?",
                category
        );
    }
}
