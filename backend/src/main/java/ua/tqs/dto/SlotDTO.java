package ua.tqs.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import ua.tqs.enums.ChargingType;

@Data
@Getter
@Setter
public class SlotDTO {
    private Long id;
    private String stationName;
    private boolean reserved;
    private ChargingType chargingType;
    private String power;
}
