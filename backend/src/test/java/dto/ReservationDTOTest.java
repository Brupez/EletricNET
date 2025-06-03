package dto;

import org.junit.jupiter.api.Test;
import ua.tqs.dto.ReservationResponseDTO;

import static org.assertj.core.api.Assertions.assertThat;

class ReservationDTOTest {

    @Test
    void testReservationResponseDTO() {

        ReservationResponseDTO dto = new ReservationResponseDTO();
        dto.setId(1L);
        dto.setUserId(2L);
        dto.setSlotId(1L);
        dto.setState("PENDING");
        dto.setConsumptionKWh(50.0);
        dto.setTotalCost(75.0);
        dto.setPaid(false);

        assertThat(dto)
            .isNotNull()
            .hasFieldOrPropertyWithValue("id", 1L)
            .hasFieldOrPropertyWithValue("userId", 2L)
            .hasFieldOrPropertyWithValue("slotId", 1L)
            .hasFieldOrPropertyWithValue("state", "PENDING")
            .hasFieldOrPropertyWithValue("consumptionKWh", 50.0)
            .hasFieldOrPropertyWithValue("totalCost", 75.0)
            .hasFieldOrPropertyWithValue("paid", false);
    }
}

