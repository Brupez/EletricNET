package ua.tqs.models;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import ua.tqs.enums.ReservationStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "reservations")
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToOne
    @JoinColumn(name = "slot_id")
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