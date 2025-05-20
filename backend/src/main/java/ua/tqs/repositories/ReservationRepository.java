package ua.tqs.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ua.tqs.models.Reservation;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
}
