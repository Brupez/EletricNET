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
public class Slot {
    @Id
    @GeneratedValue
    private Long id;

    private LocalDateTime inicio;
    private LocalDateTime fim;

    private boolean reservado;

    @ManyToOne
    private Station station;

    @OneToOne(mappedBy = "slot")
    private Reservation reservation;

    @Enumerated(EnumType.STRING)
    private ChargingType tipoDeCarregamento;
}
