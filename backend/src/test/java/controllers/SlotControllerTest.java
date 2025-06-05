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
import ua.tqs.controllers.SlotController;
import ua.tqs.dto.SlotDTO;
import ua.tqs.enums.ChargingType;
import ua.tqs.models.Slot;
import ua.tqs.models.Station;
import ua.tqs.services.SlotService;

import java.util.List;
import java.util.Optional;

import static io.restassured.module.mockmvc.RestAssuredMockMvc.given;
import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SlotControllerTest {

    @Mock
    private SlotService slotService;

    private Slot testSlot;
    private SlotDTO testSlotDTO;

    @BeforeEach
    void setup() {
        SlotController slotController = new SlotController(slotService);
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(slotController)
                .build();
        RestAssuredMockMvc.mockMvc(mockMvc);

        Station station = new Station();
        station.setId(1L);
        station.setName("Test Station");

        testSlot = new Slot();
        testSlot.setId(1L);
        testSlot.setName("Test Slot");
        testSlot.setStation(station);
        testSlot.setReserved(false);
        testSlot.setChargingType(ChargingType.FAST);
        testSlot.setPower("50.0");
        testSlot.setLatitude(40.6405);
        testSlot.setLongitude(-8.6538);

        testSlotDTO = new SlotDTO();
        testSlotDTO.setName("Test Slot");
        testSlotDTO.setStationName("Test Station");
        testSlotDTO.setReserved(false);
        testSlotDTO.setChargingType(ChargingType.FAST);
        testSlotDTO.setPower("50.0");
        testSlotDTO.setLatitude(40.6405);
        testSlotDTO.setLongitude(-8.6538);
    }

    @Test
    void getAllSlots_shouldReturn200() {
        when(slotService.getAllSlots()).thenReturn(List.of(testSlot));

        given()
            .contentType(MediaType.APPLICATION_JSON_VALUE)
        .when()
            .get("/api/slots")
        .then()
            .statusCode(200)
            .body("$", hasSize(1))
            .body("[0].name", equalTo("Test Slot"));
    }

    @Test
    void getAvailableSlots_shouldReturn200() {
        when(slotService.getAvailableSlots()).thenReturn(List.of(testSlot));

        given()
            .contentType(MediaType.APPLICATION_JSON_VALUE)
        .when()
            .get("/api/slots/available")
        .then()
            .statusCode(200)
            .body("$", hasSize(1))
            .body("[0].name", equalTo("Test Slot"));
    }

    @Test
    void getSlotById_whenExists_shouldReturn200() {
        when(slotService.getSlotById(1L)).thenReturn(Optional.of(testSlot));

        given()
            .contentType(MediaType.APPLICATION_JSON_VALUE)
        .when()
            .get("/api/slots/1")
        .then()
            .statusCode(200)
            .body("name", equalTo("Test Slot"));
    }

    @Test
    void getSlotById_whenNotExists_shouldReturn404() {
        when(slotService.getSlotById(999L)).thenReturn(Optional.empty());

        given()
            .contentType(MediaType.APPLICATION_JSON_VALUE)
        .when()
            .get("/api/slots/999")
        .then()
            .statusCode(404);
    }

    @Test
    void createSlotFromDto_whenValid_shouldReturn200() {
        when(slotService.saveOrUpdateSlotFromDTO(any(SlotDTO.class))).thenReturn(testSlot);

        given()
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .body(testSlotDTO)
        .when()
            .post("/api/slots/dto")
        .then()
            .statusCode(200)
            .body("name", equalTo("Test Slot"));
    }

    @Test
    void createSlotFromDto_whenIdProvided_shouldReturn400() {
        testSlotDTO.setId(1L);

        given()
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .body(testSlotDTO)
        .when()
            .post("/api/slots/dto")
        .then()
            .statusCode(400);
    }

    @Test
    void getSlotsByStation_shouldReturn200() {
        when(slotService.getSlotsByStationId(1L)).thenReturn(List.of(testSlot));

        given()
            .contentType(MediaType.APPLICATION_JSON_VALUE)
        .when()
            .get("/api/slots/station/1")
        .then()
            .statusCode(200)
            .body("$", hasSize(1))
            .body("[0].name", equalTo("Test Slot"));
    }

    @Test
    void deleteSlot_whenExists_shouldReturn200() {
        when(slotService.deleteSlot(1L)).thenReturn(true);

        given()
            .contentType(MediaType.APPLICATION_JSON_VALUE)
        .when()
            .delete("/api/slots/delete/1")
        .then()
            .statusCode(200)
            .body(equalTo("Slot deleted successfully."));
    }

    @Test
    void deleteSlot_whenNotExists_shouldReturn400() {
        when(slotService.deleteSlot(999L)).thenReturn(false);

        given()
            .contentType(MediaType.APPLICATION_JSON_VALUE)
        .when()
            .delete("/api/slots/delete/999")
        .then()
            .statusCode(400)
            .body(equalTo("Slot not found."));
    }

    @Test
    void getChargerStats_shouldReturn200() {
        when(slotService.getTotalChargers()).thenReturn(10L);
        when(slotService.getActiveChargers()).thenReturn(5L);

        given()
            .contentType(MediaType.APPLICATION_JSON_VALUE)
        .when()
            .get("/api/slots/stats")
        .then()
            .statusCode(200)
            .body("totalChargers", equalTo(10))
            .body("activeChargers", equalTo(5));
    }

    @Test
    void updateSlotFromDto_whenExists_shouldReturn200() {
        when(slotService.getSlotById(1L)).thenReturn(Optional.of(testSlot));
        when(slotService.saveOrUpdateSlotFromDTO(any(SlotDTO.class))).thenReturn(testSlot);

        given()
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .body(testSlotDTO)
        .when()
            .put("/api/slots/dto/1")
        .then()
            .statusCode(200)
            .body("name", equalTo("Test Slot"));
    }

    @Test
    void updateSlotFromDto_whenNotExists_shouldReturn404() {
        when(slotService.getSlotById(999L)).thenReturn(Optional.empty());

        given()
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .body(testSlotDTO)
        .when()
            .put("/api/slots/dto/999")
        .then()
            .statusCode(404);
    }
}
