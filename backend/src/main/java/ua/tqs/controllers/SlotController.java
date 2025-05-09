package ua.tqs.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ua.tqs.models.Slot;
import ua.tqs.services.SlotService;

import java.util.List;
import java.util.Optional;

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

    @PostMapping
    public ResponseEntity<Slot> createSlot(@RequestBody Slot slot) {
        return ResponseEntity.ok(slotService.saveOrUpdateSlot(slot));
    }

    @GetMapping("/station/{stationId}")
    public ResponseEntity<List<Slot>> getSlotsByStation(@PathVariable Long stationId) {
        return ResponseEntity.ok(slotService.getSlotsByStationId(stationId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSlot(@PathVariable Long id) {
        boolean success = slotService.deleteSlot(id);
        if (success) {
            return ResponseEntity.ok("Slot deleted successfully.");
        } else {
            return ResponseEntity.badRequest().body("Slot not found.");
        }
    }
}
