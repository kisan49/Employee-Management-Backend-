package com.example.employeemanagement.employee.service;

import com.example.employeemanagement.employee.dto.EmployeeDto;
import com.example.employeemanagement.employee.mapper.EmployeeMapper;
import com.example.employeemanagement.employee.model.Employee;
import com.example.employeemanagement.employee.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@Transactional
public class EmployeeService {

    private final EmployeeRepository repository;

    public EmployeeService(EmployeeRepository repository) {
        this.repository = repository;
    }

    public EmployeeDto create(EmployeeDto dto) {
        if (repository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        Employee e = EmployeeMapper.fromDto(dto);
        Employee saved = repository.save(e);
        return EmployeeMapper.toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<EmployeeDto> findAll() {
        return repository.findAll().stream().map(EmployeeMapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public EmployeeDto findById(Long id) {
        Employee e = repository.findById(id).orElseThrow(() -> new NoSuchElementException("Employee not found"));
        return EmployeeMapper.toDto(e);
    }

    public EmployeeDto update(Long id, EmployeeDto dto) {
        Employee e = repository.findById(id).orElseThrow(() -> new NoSuchElementException("Employee not found"));
        if (dto.getEmail() != null && !dto.getEmail().equals(e.getEmail()) && repository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        EmployeeMapper.updateEntity(e, dto);
        Employee saved = repository.save(e);
        return EmployeeMapper.toDto(saved);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new NoSuchElementException("Employee not found");
        }
        repository.deleteById(id);
    }
}
