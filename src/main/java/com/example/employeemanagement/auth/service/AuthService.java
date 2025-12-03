package com.example.employeemanagement.auth.service;

import com.example.employeemanagement.auth.dto.AuthDtos;
import com.example.employeemanagement.auth.model.AppUser;
import com.example.employeemanagement.auth.repository.AppUserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService implements UserDetailsService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationConfiguration authenticationConfiguration;
    private final JwtService jwtService;

    public AuthService(AppUserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationConfiguration authenticationConfiguration, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationConfiguration = authenticationConfiguration;
        this.jwtService = jwtService;
    }

    public void register(AuthDtos.RegisterRequest req) {
        String email = req.getEmail();
        String password = req.getPassword();
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            throw new IllegalArgumentException("Email and password are required");
        }
        email = email.trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered");
        }
        AppUser u = new AppUser();
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode(password));
        u.setRoles(Set.of("ROLE_USER"));
        userRepository.save(u);
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest req) {
        try {
            String email = req.getEmail() == null ? null : req.getEmail().trim().toLowerCase(Locale.ROOT);
            if (email == null || email.isBlank()) {
                throw new org.springframework.security.authentication.BadCredentialsException("Invalid credentials");
            }
            Authentication auth = getAuthenticationManager().authenticate(
                new UsernamePasswordAuthenticationToken(email, req.getPassword())
            );
            String token = jwtService.generateToken(
                auth.getName(),
                auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toSet())
            );
            return new AuthDtos.AuthResponse(token, auth.getName());
        } catch (AuthenticationException ex) {
            // Intentionally generic outward message; log class internally if needed
            throw new org.springframework.security.authentication.BadCredentialsException("Invalid credentials");
        }
    }

    private volatile AuthenticationManager authenticationManager;

    private AuthenticationManager getAuthenticationManager() {
        if (authenticationManager == null) {
            synchronized (this) {
                if (authenticationManager == null) {
                    try {
                        authenticationManager = authenticationConfiguration.getAuthenticationManager();
                    } catch (Exception e) {
                        throw new IllegalStateException("Failed to initialize AuthenticationManager", e);
                    }
                }
            }
        }
        return authenticationManager;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AppUser u = userRepository.findByEmail(username).orElseThrow(() -> new UsernameNotFoundException("User not found"));
        Set<String> roles = (u.getRoles() == null) ? Set.of() : u.getRoles();
        return new User(u.getEmail(), u.getPassword(), roles.stream().map(SimpleGrantedAuthority::new).collect(Collectors.toSet()));
    }
}
