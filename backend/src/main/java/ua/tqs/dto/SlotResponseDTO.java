package ua.tqs.dto;

import lombok.Data;
import ua.tqs.enums.ChargingType;

@Data
public class SlotResponseDTO {
    private Long id;
    private String name;
    private String stationName;
    private boolean reserved;
    private ChargingType chargingType;
    private String power;
    private Double latitude;
    private Double longitude;
    private String location;
}
