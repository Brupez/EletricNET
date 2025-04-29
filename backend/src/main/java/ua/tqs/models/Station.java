package ua.tqs.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import ua.tqs.enums.StationStatus;

import java.time.LocalTime;

@Entity
@Getter
@Setter
@Data
public class Station {
    @Id
    @GeneratedValue
    private Long id;

    private String name;
    private double latitude;
    private double longitude;

    @Enumerated(EnumType.STRING)
    private StationStatus status;

    private boolean discount;
    private double discountValue;
    private LocalTime discountStartTime;
    private LocalTime discountEndTime;

    @ManyToOne
    private User operator;
}