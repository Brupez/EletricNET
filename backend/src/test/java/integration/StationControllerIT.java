package integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = ua.tqs.EletricNET_BackendApplication.class)
@AutoConfigureMockMvc
@AutoConfigureTestDatabase
class StationControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testCreateStation() throws Exception {
        String stationJson = "{\"name\":\"Station X\",\"location\":\"City Center\"}";
        mockMvc.perform(post("/api/stations")
                .contentType("application/json")
                .content(stationJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists());
    }

    @Test
    void testToggleDiscount() throws Exception {
        mockMvc.perform(post("/api/stations/1/discount?active=true&value=0.1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Discount updated successfully."));
    }
}