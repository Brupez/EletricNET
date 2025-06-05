package ua.tqs.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ua.tqs.models.Slot;

import java.util.List;

@Repository
public interface SlotRepository extends JpaRepository<Slot, Long> {
    boolean existsByName(String name);
    boolean existsByNameAndIdNot(String name, Long id);

    List<Slot> findByReservedFalse();

    boolean existsByIdAndReservedTrue(Long id);
}
