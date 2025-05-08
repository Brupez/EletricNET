package ua.tqs.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import ua.tqs.models.Reservation;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
}
