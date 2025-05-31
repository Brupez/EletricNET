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
import ua.tqs.controllers.ReservationController;
import ua.tqs.dto.ReservationRequestDTO;
import ua.tqs.dto.ReservationResponseDTO;
import ua.tqs.login.JwtUtil;
import ua.tqs.models.User;
import ua.tqs.repositories.UserRepository;
import ua.tqs.services.ReservationService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static io.restassured.module.mockmvc.RestAssuredMockMvc.given;
import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReservationControllerTest {

    @Mock
    private ReservationService reservationService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtil jwtUtil;

    private static final String VALID_TOKEN = "Bearer valid.jwt.token";
    private static final String USER_EMAIL = "test@example.com";

    private ReservationResponseDTO testReservationResponse;
    private ReservationRequestDTO testReservationRequest;
    private User testUser;

    @BeforeEach
    void setup() {
        ReservationController reservationController = new ReservationController(
            reservationService,
            userRepository,
            jwtUtil
        );
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(reservationController)
                .build();
        RestAssuredMockMvc.mockMvc(mockMvc);

        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail(USER_EMAIL);

        testReservationRequest = new ReservationRequestDTO();
        testReservationRequest.setUserId(1L);
        testReservationRequest.setSlotId("slot1");
        testReservationRequest.setStartTime(LocalDateTime.now());
        testReservationRequest.setDurationMinutes(60);

        testReservationResponse = new ReservationResponseDTO();
        testReservationResponse.setId(1L);
        testReservationResponse.setUserId(1L);
        testReservationResponse.setSlotId("slot1");
        testReservationResponse.setState("ACTIVE");
        testReservationResponse.setStartTime(LocalDateTime.now());
        testReservationResponse.setDurationMinutes(60);
        testReservationResponse.setStationName("Test Station");
        testReservationResponse.setChargingType("FAST");


    }

    @Test
    void getAllReservations_shouldReturn200() {
        when(reservationService.getAllReservations())
            .thenReturn(List.of(testReservationResponse));

        given()
            .contentType(MediaType.APPLICATION_JSON_VALUE)
        .when()
            .get("/api/reservations")
        .then()
            .statusCode(200)
            .body("$", hasSize(1))
            .body("[0].id", equalTo(1))
            .body("[0].state", equalTo("ACTIVE"));
    }

    @Test
    void createReservation_whenValidRequest_shouldReturn200() {
        when(jwtUtil.getUsername("valid.jwt.token")).thenReturn(USER_EMAIL);
        when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(testUser));
        when(reservationService.createReservation(any(ReservationRequestDTO.class)))
            .thenReturn(Optional.of(testReservationResponse));

        given()
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .header("Authorization", VALID_TOKEN)
            .body(testReservationRequest)
        .when()
            .post("/api/reservations/create")
        .then()
            .statusCode(200)
            .body("id", equalTo(1))
            .body("state", equalTo("ACTIVE"));
    }

    @Test
    void createReservation_whenUserNotFound_shouldReturn403() {
        when(jwtUtil.getUsername("valid.jwt.token")).thenReturn(USER_EMAIL);
        when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.empty());

        given()
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .header("Authorization", VALID_TOKEN)
            .body(testReservationRequest)
        .when()
            .post("/api/reservations/create")
        .then()
            .statusCode(403);
    }

    @Test
    void cancelReservation_whenExists_shouldReturn200() {
        when(reservationService.cancelReservation(1L)).thenReturn(true);

        given()
            .contentType(MediaType.APPLICATION_JSON_VALUE)
        .when()
            .put("/api/reservations/1/cancel")
        .then()
            .statusCode(200)
            .body(equalTo("Reservation successfully cancelled."));
    }

    @Test
    void cancelReservation_whenNotExists_shouldReturn400() {
        when(reservationService.cancelReservation(999L)).thenReturn(false);

        given()
            .contentType(MediaType.APPLICATION_JSON_VALUE)
        .when()
            .put("/api/reservations/999/cancel")
        .then()
            .statusCode(400)
            .body(equalTo("Reservation not found or already cancelled."));
    }

    @Test
    void getMyReservations_shouldReturn200() {
        when(reservationService.getReservationsByToken("valid.jwt.token"))
            .thenReturn(List.of(testReservationResponse));

        given()
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .header("Authorization", VALID_TOKEN)
        .when()
            .get("/api/reservations/myReservations")
        .then()
            .statusCode(200)
            .body("$", hasSize(1))
            .body("[0].id", equalTo(1));
    }

    @Test
    void getRevenue_shouldReturn200() {
        when(reservationService.getTotalRevenue()).thenReturn(100.0);

        given()
            .contentType(MediaType.APPLICATION_JSON_VALUE)
        .when()
            .get("/api/reservations/revenue")
        .then()
            .statusCode(200)
            .body("totalRevenue", equalTo(100.0f));
    }
}