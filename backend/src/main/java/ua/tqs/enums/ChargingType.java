package ua.tqs.enums;

import lombok.Getter;

@Getter
public enum ChargingType {
    NORMAL(0.15),
    FAST(0.30),
    ULTRA_FAST(0.45);

    private final double pricePerKwh;

    ChargingType(double pricePerKwh) {
        this.pricePerKwh = pricePerKwh;
    }

}
