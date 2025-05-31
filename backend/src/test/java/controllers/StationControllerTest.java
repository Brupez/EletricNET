package controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import ua.tqs.controllers.StationController;
import ua.tqs.models.Station;
import ua.tqs.services.StationService;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StationControllerTest {

    @Mock
    private StationService stationService;

    @InjectMocks
    private StationController stationController;

    private Station station;

    @BeforeEach
    void setUp() {
        station = new Station();
        station.setId(1L);
        station.setName("Test Station");
        station.setDiscountValue(0.0);
    }

    @Test
    void getAllStations_ReturnsAllStations() {
        when(stationService.getAllStations()).thenReturn(List.of(station));

        ResponseEntity<List<Station>> response = stationController.getAllStations();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody())
            .isNotNull()
            .hasSize(1)
            .contains(station);
    }

    @Test
    void getStationById_WhenExists_ReturnsStation() {
        when(stationService.getStationById(1L)).thenReturn(Optional.of(station));

        ResponseEntity<Station> response = stationController.getStationById(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody())
            .isNotNull()
            .isEqualTo(station);
    }

    @Test
    void getStationById_WhenNotExists_ReturnsNotFound() {
        when(stationService.getStationById(1L)).thenReturn(Optional.empty());

        ResponseEntity<Station> response = stationController.getStationById(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNull();
    }

    @Test
    void createOrUpdateStation_ReturnsCreatedStation() {
        when(stationService.saveOrUpdateStation(station)).thenReturn(station);

        ResponseEntity<Station> response = stationController.createOrUpdateStation(station);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody())
            .isNotNull()
            .isEqualTo(station);
    }

    @Test
    void toggleDiscount_WhenStationExists_ReturnsSuccess() {
        when(stationService.toggleDiscount(1L, true, 0.1)).thenReturn(true);

        ResponseEntity<String> response = stationController.toggleDiscount(1L, true, 0.1);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo("Discount updated successfully.");
    }

    @Test
    void toggleDiscount_WhenStationNotExists_ReturnsBadRequest() {
        when(stationService.toggleDiscount(1L, true, 0.1)).thenReturn(false);

        ResponseEntity<String> response = stationController.toggleDiscount(1L, true, 0.1);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isEqualTo("Station not found.");
    }
}