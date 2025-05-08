package ua.tqs.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import ua.tqs.models.Slot;

public interface SlotRepository extends JpaRepository<Slot, Long> {
}
