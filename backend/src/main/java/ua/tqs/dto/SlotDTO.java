package ua.tqs.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import ua.tqs.enums.ChargingType;

@Data
@Getter
@Setter
public class SlotDTO {
    private String id;
    private String name;
    private String stationName;
    private boolean reserved;
    private ChargingType chargingType;
    private String power;
    private Double latitude;
    private Double longitude;

}
