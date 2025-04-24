package ua.tqs.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import ua.tqs.enums.ReservationStatus;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Data
public class Reservation {
    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    private User user;

    @OneToOne
    private Slot slot;

    @Enumerated(EnumType.STRING)
    private ReservationStatus estado;

    private LocalDateTime dataCriacao;

    private Double consumoKWh;
    private Double custoTotal;
    private boolean pago;
}
