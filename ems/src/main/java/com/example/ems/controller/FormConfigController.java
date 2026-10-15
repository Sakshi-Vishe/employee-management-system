
package com.example.ems.controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.CrossOrigin;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/form-config")
public class FormConfigController {

    private final JdbcTemplate jdbcTemplate;

    public FormConfigController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/{formName}")
    public List<Map<String, Object>> getFormConfig(
            @PathVariable String formName) {

        if (!"employee".equalsIgnoreCase(formName)) {
            throw new IllegalArgumentException("Form configuration not found");
        }

        String sql = """
            SELECT
                field_key AS `key`,
                label,
                field_type AS type,
                is_required AS required,
                options_api AS optionsApi,
                validation_json AS validationJson,
                visible_when AS visibleWhen,
                display_order AS displayOrder
            FROM form_fields
            WHERE LOWER(form_name) = LOWER(?)
            ORDER BY display_order
            """;

        return jdbcTemplate.queryForList(sql, formName);
    }
}
