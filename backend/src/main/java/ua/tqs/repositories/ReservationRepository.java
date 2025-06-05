package ua.tqs.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ua.tqs.models.Reservation;
import ua.tqs.enums.ReservationStatus;
import ua.tqs.models.User;

import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUser(User user);

    List<Reservation> findBySlot_IdAndStatus(Long slotId, ReservationStatus status);
    List<Reservation> findByUser_IdAndStatus(Long userId, ReservationStatus status);
}
