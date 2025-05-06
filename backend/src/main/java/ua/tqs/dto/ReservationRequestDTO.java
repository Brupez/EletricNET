package ua.tqs.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class ReservationRequestDTO {
    private Long userId;
    private Long slotId;
    private Double consumptionKWh;
    private Double pricePerKWh;
}

