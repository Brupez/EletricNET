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

@CrossOrigin(origins = "http://localhost", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authManager;
    private final UserDetailsServiceImpl userDetailsService;
    private final JwtUtil jwtUtil;

    @Autowired
    public AuthController(AuthenticationManager authManager,UserDetailsServiceImpl userDetailsService,JwtUtil jwtUtil) {
        this.authManager = authManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody AuthRequest request) {
        try {
            authManager.authenticate(new UsernamePasswordAuthenticationToken(
                    request.getEmail(), request.getPassword()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String token = jwtUtil.generateToken(
                userDetails.getUsername(),
                userDetails.getAuthorities().iterator().next().getAuthority()
        );

        String role = userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        Long userId = userDetailsService.getUserId(userDetails);

        String name = userDetailsService.getUserName(userDetails);
        String email = userDetails.getUsername();

        return ResponseEntity.ok(new AuthResponse(token, role, userId, name, email));

    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody AuthRequest request) {
        if (userDetailsService.userExists(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        try {
            userDetailsService.registerUser(
                    request.getEmail(),
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
