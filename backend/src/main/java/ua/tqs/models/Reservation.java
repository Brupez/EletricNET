package ua.tqs.models;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import ua.tqs.enums.ReservationStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Data
@Table(name = "reservations")
public class Reservation {
    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    private User user;

    @ManyToOne
    @JsonManagedReference
    private Slot slot;

    @Enumerated(EnumType.STRING)
    private ReservationStatus status;

    private LocalDateTime creationDate;

    private LocalDate startDate;
    private LocalDateTime startTime;
    private Integer durationMinutes;

    private Double consumptionKWh;
    private Double totalCost;
    private boolean paid;
}