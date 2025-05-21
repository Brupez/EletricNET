package ua.tqs.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ua.tqs.dto.SlotDTO;
import ua.tqs.models.Slot;
import ua.tqs.models.Station;
import ua.tqs.repositories.SlotRepository;
import ua.tqs.repositories.StationRepository;

import java.util.List;
import java.util.Optional;

@Service
public class SlotService {

    @Autowired
    private SlotRepository slotRepository;

    @Autowired
    private StationRepository stationRepository;

    public List<Slot> getAllSlots() {
        return slotRepository.findAll();
    }

    public Optional<Slot> getSlotById(Long id) {
        return slotRepository.findById(id);
    }

    public Slot saveOrUpdateSlot(Slot slot) {
        return slotRepository.save(slot);
    }

    public List<Slot> getSlotsByStationId(Long stationId) {
        return slotRepository.findAll()
                .stream()
                .filter(slot -> slot.getStation().getId().equals(stationId))
                .toList();
    }

    public boolean deleteSlot(Long id) {
        if (slotRepository.existsById(id)) {
            slotRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public long getTotalChargers() {
        return slotRepository.count();
    }

    public long getActiveChargers() {
        return slotRepository.findAll().stream()
                .filter(slot -> !slot.isReserved())
                .count();
    }

    public Slot saveOrUpdateSlotFromDTO(SlotDTO dto) {
        Station station = stationRepository.findByName(dto.getStationName())
                .orElseGet(() -> {
                    Station newStation = new Station();
                    newStation.setName(dto.getStationName());
                    return stationRepository.save(newStation);
                });

        Slot slot = (dto.getId() != null)
                ? slotRepository.findById(dto.getId()).orElse(new Slot())
                : new Slot();

        slot.setName(dto.getName());
        slot.setStation(station);
        slot.setReserved(dto.isReserved());
        slot.setChargingType(dto.getChargingType());
        slot.setPower(dto.getPower());

        return slotRepository.save(slot);
    }
}
