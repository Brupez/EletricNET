package ua.tqs.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReservationResponseDTO {
    private Long id;
    private Long userId;
    private String slotId;
    private String state;
    private Double consumptionKWh;
    private Double totalCost;
    private boolean paid;
    private String stationName;
    private String chargingType;

    private LocalDateTime createdAt;

    private LocalDateTime startTime;
    private Integer durationMinutes;
}
