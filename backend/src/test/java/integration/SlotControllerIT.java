package integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import com.fasterxml.jackson.databind.ObjectMapper;
import ua.tqs.models.Slot;
import ua.tqs.models.Station;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = ua.tqs.EletricNET_BackendApplication.class)
@AutoConfigureMockMvc
@AutoConfigureTestDatabase
class SlotControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testCreateSlot() throws Exception {
        Station station = new Station();
        station.setId(1L);
        station.setName("Station A");

        Slot slot = new Slot();
        slot.setStation(station);
        slot.setReserved(false);

        mockMvc.perform(post("/api/slots")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(slot)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists());
    }
}