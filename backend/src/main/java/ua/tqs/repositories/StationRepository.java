package ua.tqs.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ua.tqs.models.Station;

@Repository
public interface StationRepository extends JpaRepository<Station, Long> {
}
