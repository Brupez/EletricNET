package ua.tqs.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
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
    private String id;

    @Column(nullable = false)
    private String name;

    @Column
    private Double latitude;

    @Column
    private Double longitude;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private boolean reserved;

    @ManyToOne
    private Station station;

    @OneToOne(mappedBy = "slot")
    @JsonBackReference
    private Reservation reservation;

    @Enumerated(EnumType.STRING)
    private ChargingType chargingType;

    private String power;
}