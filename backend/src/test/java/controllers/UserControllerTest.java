package controllers;

import io.restassured.module.mockmvc.RestAssuredMockMvc;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import ua.tqs.controllers.UserController;
import ua.tqs.enums.UserRole;
import ua.tqs.models.User;
import ua.tqs.services.UserService;

import java.util.List;

import static io.restassured.module.mockmvc.RestAssuredMockMvc.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @BeforeEach
    void setup() {
        UserController userController = new UserController(userService);
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(userController)
                .build();
        RestAssuredMockMvc.mockMvc(mockMvc);
    }

    @Test
    void getAllUsers_shouldReturn200() {
        User user = new User(1L, "test@example.com", "123", "Test User", UserRole.USER);
        when(userService.getAllUsers()).thenReturn(List.of(user));

        given()
            .contentType(MediaType.APPLICATION_JSON_VALUE)
        .when()
            .get("/api/users")
        .then()
            .statusCode(200)
            .body("$", hasSize(1))
            .body("[0].email", equalTo("test@example.com"));
    }

    @Test
    void getTotalUsers_shouldReturn200() {
        when(userService.getTotalUsers()).thenReturn(1L);

        given()
            .contentType(MediaType.APPLICATION_JSON_VALUE)
        .when()
            .get("/api/users/total-users")
        .then()
            .statusCode(200)
            .body(equalTo("1"));
    }
}