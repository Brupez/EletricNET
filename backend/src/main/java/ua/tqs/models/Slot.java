package ua.tqs.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import ua.tqs.enums.ChargingType;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Data
@Table(name = "slots")
public class Slot {
    @Id
    @GeneratedValue
    private Long id;

    private String name;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private boolean reserved;

    @ManyToOne
    private Station station;

    @OneToOne(mappedBy = "slot")
    private Reservation reservation;

    @Enumerated(EnumType.STRING)
    private ChargingType chargingType;

    private String power;
}