package com.example.employeemanagement.employee.mapper;

import com.example.employeemanagement.employee.dto.EmployeeDto;
import com.example.employeemanagement.employee.model.Employee;

public class EmployeeMapper {
    public static EmployeeDto toDto(Employee e) {
        EmployeeDto dto = new EmployeeDto();
        dto.setId(e.getId());
        dto.setFirstName(e.getFirstName());
        dto.setLastName(e.getLastName());
        dto.setEmail(e.getEmail());
        dto.setDepartment(e.getDepartment());
        dto.setPosition(e.getPosition());
        return dto;
    }

    public static Employee fromDto(EmployeeDto dto) {
        Employee e = new Employee();
        e.setId(dto.getId());
        e.setFirstName(dto.getFirstName());
        e.setLastName(dto.getLastName());
        e.setEmail(dto.getEmail());
        e.setDepartment(dto.getDepartment());
        e.setPosition(dto.getPosition());
        return e;
    }

    public static void updateEntity(Employee e, EmployeeDto dto) {
        if (dto.getFirstName() != null) e.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) e.setLastName(dto.getLastName());
        if (dto.getEmail() != null) e.setEmail(dto.getEmail());
        if (dto.getDepartment() != null) e.setDepartment(dto.getDepartment());
        if (dto.getPosition() != null) e.setPosition(dto.getPosition());
    }
}
