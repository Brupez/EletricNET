package ua.tqs.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import ua.tqs.dto.AuthRequest;
import ua.tqs.dto.AuthResponse;
import ua.tqs.login.JwtUtil;
import ua.tqs.services.UserDetailsServiceImpl;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            authManager.authenticate(new UsernamePasswordAuthenticationToken(
                    request.getUsername(), request.getPassword()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String token = jwtUtil.generateToken(userDetails.getUsername(), userDetails.getAuthorities().iterator().next().getAuthority());

        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        if (userDetailsService.userExists(request.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        try {
            userDetailsService.registerUser(
                    request.getUsername(),
                    request.getPassword(),
                    request.getName(),
                    request.getRole()
            );
            return ResponseEntity.ok("User registered successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid role: must be USER or ADMIN");
        }
    }
}
