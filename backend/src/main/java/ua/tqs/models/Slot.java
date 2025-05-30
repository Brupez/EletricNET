package ua.tqs.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import ua.tqs.enums.ChargingType;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@Data
@Table(name = "slots")
public class Slot {
    @Id
    @GeneratedValue
    private Long id;

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

    @OneToMany(mappedBy = "slot")
    @JsonBackReference
    private List<Reservation> reservations;

    @Enumerated(EnumType.STRING)
    private ChargingType chargingType;

    private String power;
}