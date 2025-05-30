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

    private final SlotRepository slotRepository;
    private final StationRepository stationRepository;

    @Autowired
    public SlotService(SlotRepository slotRepository, StationRepository stationRepository) {
        this.slotRepository = slotRepository;
        this.stationRepository = stationRepository;
    }

    public List<Slot> getAllSlots() {
        return slotRepository.findAll();
    }

    public List<Slot> getAvailableSlots() {
        return slotRepository.findByReservedFalse();
    }

    public Optional<Slot> getSlotById(Long id) {
        return slotRepository.findById(id);
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
        if (dto.getId() != null) {
            if (slotRepository.existsByNameAndIdNot(dto.getName(), dto.getId())) {
                throw new IllegalArgumentException("Slot name already exists");
            }
        } else {
            if (slotRepository.existsByName(dto.getName())) {
                throw new IllegalArgumentException("Slot name already exists");
            }
        }

        Station station = stationRepository.findByName(dto.getStationName())
                .orElseGet(() -> {
                    Station newStation = new Station();
                    newStation.setName(dto.getStationName());
                    return stationRepository.save(newStation);
                });

        Slot slot;
        if (dto.getId() != null) {
            Optional<Slot> existingSlot = slotRepository.findById(dto.getId());
            if (existingSlot.isEmpty()) {
                throw new IllegalArgumentException("Slot with given ID not found");
            }
            slot = existingSlot.get();
        } else {
            slot = new Slot();
        }

        slot.setName(dto.getName());
        slot.setStation(station);
        slot.setReserved(dto.isReserved());
        slot.setChargingType(dto.getChargingType());
        slot.setPower(dto.getPower());
        slot.setLatitude(dto.getLatitude());
        slot.setLongitude(dto.getLongitude());

        return slotRepository.save(slot);
    }
}
