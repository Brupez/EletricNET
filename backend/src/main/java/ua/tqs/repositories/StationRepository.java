package ua.tqs.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import ua.tqs.models.Station;

public interface StationRepository extends JpaRepository<Station, Long> {
}
