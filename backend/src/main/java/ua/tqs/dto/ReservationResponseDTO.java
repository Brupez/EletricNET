package ua.tqs.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReservationResponseDTO {
    private Long id;
    private Long userId;
    private Long slotId;
    private String state;
    private Double consumptionKWh;
    private Double totalCost;
    private boolean paid;
    private String stationLocation;
    private String slotLabel;
    private String chargingType;

    private String userName;
    private String userEmail;

    private LocalDateTime createdAt;

    private LocalDateTime startTime;
    private Integer durationMinutes;
}
