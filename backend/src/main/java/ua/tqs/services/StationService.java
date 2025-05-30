package ua.tqs.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ua.tqs.models.Station;
import ua.tqs.repositories.StationRepository;

import java.util.List;
import java.util.Optional;

@Service
public class StationService {

    private final StationRepository stationRepository;

    @Autowired
    public StationService(StationRepository stationRepository) {
        this.stationRepository = stationRepository;
    }

    public List<Station> getAllStations() {
        return stationRepository.findAll();
    }

    public Optional<Station> getStationById(Long id) {
        return stationRepository.findById(id);
    }

    public Station saveOrUpdateStation(Station station) {
        return stationRepository.save(station);
    }

    public boolean toggleDiscount(Long stationId, boolean active, double value) {
        Optional<Station> optionalStation = stationRepository.findById(stationId);
        if (optionalStation.isEmpty()) return false;

        Station station = optionalStation.get();
        station.setDiscount(active);
        station.setDiscountValue(value);
        stationRepository.save(station);
        return true;
    }
}