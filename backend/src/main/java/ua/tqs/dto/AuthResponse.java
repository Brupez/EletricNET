package ua.tqs.dto;

import lombok.Data;

@Data
public class AuthResponse {
    private String token;
    private String role;
    private Long userId;

    public AuthResponse(String token, String role, Long userId) {
        this.token = token;
        this.role = role;
        this.userId = userId;
    }
}