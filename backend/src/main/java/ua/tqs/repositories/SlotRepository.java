package ua.tqs.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ua.tqs.models.Slot;

import java.util.List;

@Repository
public interface SlotRepository extends JpaRepository<Slot, String> {
    boolean existsByName(String name);
    boolean existsByNameAndIdNot(String name, String id);

    List<Slot> findByReservedFalse();
}
