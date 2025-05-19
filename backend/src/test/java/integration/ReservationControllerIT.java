package integration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import com.fasterxml.jackson.databind.ObjectMapper;
import ua.tqs.dto.AuthRequest;
import ua.tqs.dto.ReservationRequestDTO;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = ua.tqs.EletricNET_BackendApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ReservationControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String authToken;

    @BeforeEach
    void setUp() throws Exception {
        AuthRequest authRequest = new AuthRequest();
        authRequest.setUsername("user");
        authRequest.setPassword("pass");
        
        String response = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(authRequest)))
                .andReturn().getResponse().getContentAsString();
        
        authToken = response.split(":")[1].replaceAll("\"|}", "").trim();
    }

    @Test
    void testCreateReservation() throws Exception {
        ReservationRequestDTO dto = new ReservationRequestDTO();
        dto.setUserId(1L);
        dto.setSlotId(1L);
        dto.setConsumptionKWh(10.5);
        dto.setPricePerKWh(0.15);

        mockMvc.perform(post("/api/reservations/create")
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists());
    }
}