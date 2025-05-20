package ua.tqs.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import ua.tqs.models.Reservation;
import ua.tqs.models.User;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUser(User user);
}
