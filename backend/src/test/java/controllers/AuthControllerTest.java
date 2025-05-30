package controllers;

import io.restassured.module.mockmvc.RestAssuredMockMvc;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import ua.tqs.EletricNET_BackendApplication;
import ua.tqs.controllers.AuthController;
import ua.tqs.dto.AuthRequest;
import ua.tqs.login.JwtUtil;
import ua.tqs.services.UserDetailsServiceImpl;

import java.util.List;

import static io.restassured.module.mockmvc.RestAssuredMockMvc.given;
import static org.hamcrest.Matchers.equalTo;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@ContextConfiguration(classes = EletricNET_BackendApplication.class)
class AuthControllerTest {

    @Mock
    private AuthenticationManager authManager;

    @Mock
    private UserDetailsServiceImpl userDetailsService;

    @Mock
    private JwtUtil jwtUtil;

    @BeforeEach
    void setup() {
        AuthController authController = new AuthController(authManager, userDetailsService, jwtUtil);
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(authController)
                .build();
        RestAssuredMockMvc.mockMvc(mockMvc);
    }

    @Test
    void whenLogin_withValidCredentials_thenReturn200AndToken() {
        AuthRequest request = new AuthRequest();
        request.setEmail("test@example.com");
        request.setPassword("password");

        UserDetails userDetails = new User("test@example.com", "password",
                List.of(new SimpleGrantedAuthority("ROLE_USER")));

        when(userDetailsService.loadUserByUsername("test@example.com")).thenReturn(userDetails);
        when(jwtUtil.generateToken(anyString(), anyString())).thenReturn("test-token");
        when(userDetailsService.getUserId(any())).thenReturn(1L);
        when(userDetailsService.getUserName(any())).thenReturn("Test User");

        given()
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .body(request)
        .when()
            .post("/api/auth/login")
        .then()
            .statusCode(200)
            .body("token", equalTo("test-token"))
            .body("role", equalTo("USER"))
            .body("userId", equalTo(1))
            .body("name", equalTo("Test User"))
            .body("email", equalTo("test@example.com"));
    }

    @Test
    void whenLogin_withInvalidCredentials_thenReturn401() {
        AuthRequest request = new AuthRequest();
        request.setEmail("test@example.com");
        request.setPassword("wrongpass");

        doThrow(new BadCredentialsException("Invalid credentials"))
            .when(authManager)
            .authenticate(any(UsernamePasswordAuthenticationToken.class));

        given()
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .body(request)
        .when()
            .post("/api/auth/login")
        .then()
            .statusCode(401)
            .body(equalTo("Invalid email or password"));
    }

    @Test
    void whenRegister_withNewUser_thenReturn200() {
        AuthRequest request = new AuthRequest();
        request.setEmail("new@example.com");
        request.setPassword("password");
        request.setName("New User");
        request.setRole("USER");

        when(userDetailsService.userExists("new@example.com")).thenReturn(false);

        given()
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .body(request)
        .when()
            .post("/api/auth/register")
        .then()
            .statusCode(200)
            .body(equalTo("User registered successfully"));
    }

    @Test
    void whenRegister_withExistingEmail_thenReturn400() {
        AuthRequest request = new AuthRequest();
        request.setEmail("existing@example.com");
        request.setPassword("password");
        request.setName("Existing User");
        request.setRole("USER");

        when(userDetailsService.userExists("existing@example.com")).thenReturn(true);

        given()
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .body(request)
        .when()
            .post("/api/auth/register")
        .then()
            .statusCode(400)
            .body(equalTo("Email already exists"));
    }

    @Test
    void whenRegister_withInvalidRole_thenReturn400() {
        AuthRequest request = new AuthRequest();
        request.setEmail("new@example.com");
        request.setPassword("password");
        request.setName("New User");
        request.setRole("INVALID_ROLE");

        when(userDetailsService.userExists("new@example.com")).thenReturn(false);
        doThrow(new IllegalArgumentException("Invalid role: must be USER or ADMIN"))
            .when(userDetailsService)
            .registerUser(anyString(), anyString(), anyString(), anyString());

        given()
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .body(request)
        .when()
            .post("/api/auth/register")
        .then()
            .statusCode(400)
            .body(equalTo("Invalid role: must be USER or ADMIN"));
    }
}
