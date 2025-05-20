package ua.tqs.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ua.tqs.models.Slot;
import ua.tqs.repositories.SlotRepository;

import java.util.List;
import java.util.Optional;

@Service
public class SlotService {

    @Autowired
    private SlotRepository slotRepository;

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
}
