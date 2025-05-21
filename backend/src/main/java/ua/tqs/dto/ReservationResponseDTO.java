package ua.tqs.dto;

import lombok.Data;

@Data
public class ReservationResponseDTO {
    private Long id;
    private Long userId;
    private Long slotId;
    private String state;
    private Double consumptionKWh;
    private Double totalCost;
    private boolean paid;
    private String stationName;
    private String chargingType;
}
