package ua.tqs.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ua.tqs.models.Station;
import ua.tqs.services.StationService;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://deti-tqs-05.ua.pt", allowCredentials = "true")
@RestController
@RequestMapping("/api/stations")
public class StationController {

    private final StationService stationService;

    @Autowired
    public StationController(StationService stationService) {
        this.stationService = stationService;
    }

    @GetMapping
    public ResponseEntity<List<Station>> getAllStations() {
        return ResponseEntity.ok(stationService.getAllStations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Station> getStationById(@PathVariable Long id) {
        Optional<Station> station = stationService.getStationById(id);
        return station.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Station> createOrUpdateStation(@RequestBody Station station) {
        return ResponseEntity.ok(stationService.saveOrUpdateStation(station));
    }

    @PostMapping("/{id}/discount")
    public ResponseEntity<String> toggleDiscount(@PathVariable Long id,
                                               @RequestParam boolean active,
                                               @RequestParam double value) {
        boolean updated = stationService.toggleDiscount(id, active, value);
        if (updated) {
            return ResponseEntity.ok("Discount updated successfully.");
        } else {
            return ResponseEntity.badRequest().body("Station not found.");
        }
    }
}