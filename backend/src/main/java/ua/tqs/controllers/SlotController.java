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

    @Autowired
    private SlotService slotService;

    @GetMapping
    public ResponseEntity<List<Slot>> getAllSlots() {
        return ResponseEntity.ok(slotService.getAllSlots());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSlotById(@PathVariable Long id) {
        Optional<Slot> slot = slotService.getSlotById(id);
        return slot.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/dto")
    public ResponseEntity<Slot> createSlotFromDto(@RequestBody SlotDTO slotDTO) {
        Slot created = slotService.saveOrUpdateSlotFromDTO(slotDTO);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/station/{stationId}")
    public ResponseEntity<List<Slot>> getSlotsByStation(@PathVariable Long stationId) {
        return ResponseEntity.ok(slotService.getSlotsByStationId(stationId));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteSlot(@PathVariable Long id) {
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
    public ResponseEntity<?> updateSlotFromDto(@PathVariable Long id, @RequestBody SlotDTO slotDTO) {
        Optional<Slot> existingSlot = slotService.getSlotById(id);
        if (existingSlot.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        slotDTO.setId(id);

        Slot updated = slotService.saveOrUpdateSlotFromDTO(slotDTO);
        return ResponseEntity.ok(updated);
    }

}
