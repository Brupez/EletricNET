package ua.tqs.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReservationRequestDTO {
    private Long userId;
    private String slotId;
    private Double consumptionKWh;
    private Double pricePerKWh;

    private LocalDateTime startTime;
    private Integer durationMinutes;
}
