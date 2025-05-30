package ua.tqs.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ua.tqs.dto.SlotDTO;
import ua.tqs.models.Slot;
import ua.tqs.services.SlotService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/slots")
public class SlotController {

    private final SlotService slotService;

    @Autowired
    public SlotController(SlotService slotService) {
        this.slotService = slotService;
    }


    @GetMapping
    public ResponseEntity<List<Slot>> getAllSlots() {
        return ResponseEntity.ok(slotService.getAllSlots());
    }

    @GetMapping("/available")
    public ResponseEntity<List<Slot>> getAvailableSlots() {
        return ResponseEntity.ok(slotService.getAvailableSlots());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Slot> getSlotById(@PathVariable Long id) {
        Optional<Slot> slot = slotService.getSlotById(id);
        return slot.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/dto")
    public ResponseEntity<Object> createSlotFromDto(@RequestBody SlotDTO slotDTO) {
        if (slotDTO.getId() != null) {
            return ResponseEntity.badRequest().body("ID should not be provided when creating a new slot.");
        }

        try {
            Slot created = slotService.saveOrUpdateSlotFromDTO(slotDTO);
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/station/{stationId}")
    public ResponseEntity<List<Slot>> getSlotsByStation(@PathVariable Long stationId) {
        return ResponseEntity.ok(slotService.getSlotsByStationId(stationId));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteSlot(@PathVariable Long id) {
        boolean success = slotService.deleteSlot(id);
        if (success) {
            return ResponseEntity.ok("Slot deleted successfully.");
        } else {
            return ResponseEntity.badRequest().body("Slot not found.");
        }
    }

    @GetMapping("/chargers")
    public ResponseEntity<List<Slot>> getAllChargers() {
        List<Slot> slots = slotService.getAllSlots();
        return ResponseEntity.ok(slots);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getChargerStats() {
        long totalChargers = slotService.getTotalChargers();
        long activeChargers = slotService.getActiveChargers();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalChargers", totalChargers);
        stats.put("activeChargers", activeChargers);

        return ResponseEntity.ok(stats);
    }

    @PutMapping("/dto/{id}")
    public ResponseEntity<Object> updateSlotFromDto(@PathVariable Long id, @RequestBody SlotDTO slotDTO) {
        Optional<Slot> existingSlot = slotService.getSlotById(id);
        if (existingSlot.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        slotDTO.setId(id);
        try {
            Slot updated = slotService.saveOrUpdateSlotFromDTO(slotDTO);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}