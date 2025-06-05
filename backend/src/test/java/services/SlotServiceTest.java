package services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ua.tqs.dto.SlotDTO;
import ua.tqs.enums.ChargingType;
import ua.tqs.models.Slot;
import ua.tqs.models.Station;
import ua.tqs.repositories.SlotRepository;
import ua.tqs.repositories.StationRepository;
import ua.tqs.services.SlotService;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SlotServiceTest {

    @Mock
    private SlotRepository slotRepository;

    @Mock
    private StationRepository stationRepository;

    @InjectMocks
    private SlotService slotService;

    private SlotDTO slotDTO;
    private Station station;
    private Slot slot;

    @BeforeEach
    void setUp() {
        station = new Station();
        station.setId(1L);
        station.setName("Test Station");

        slotDTO = new SlotDTO();
        slotDTO.setName("Test Slot");
        slotDTO.setStationName("Test Station");
        slotDTO.setReserved(false);
        slotDTO.setChargingType(ChargingType.FAST);
        slotDTO.setPower("50.0");
        slotDTO.setLatitude(40.6405);
        slotDTO.setLongitude(-8.6538);

        slot = new Slot();
        slot.setId(1L);
        slot.setName("Test Slot");
        slot.setStation(station);
        slot.setReserved(false);
        slot.setChargingType(ChargingType.FAST);
        slot.setPower("50.0");
        slot.setLatitude(40.6405);
        slot.setLongitude(-8.6538);
    }

    @Test
    void whenSaveNewSlot_thenSuccess() {
        when(stationRepository.findByName("Test Station")).thenReturn(Optional.of(station));
        when(slotRepository.existsByName("Test Slot")).thenReturn(false);
        when(slotRepository.save(any(Slot.class))).thenReturn(slot);

        Slot savedSlot = slotService.saveOrUpdateSlotFromDTO(slotDTO);

        assertThat(savedSlot.getName()).isEqualTo(slotDTO.getName());
        assertThat(savedSlot.getStation().getName()).isEqualTo(slotDTO.getStationName());
        assertThat(savedSlot.isReserved()).isEqualTo(slotDTO.isReserved());
        assertThat(savedSlot.getChargingType()).isEqualTo(slotDTO.getChargingType());
        assertThat(savedSlot.getPower()).isEqualTo(slotDTO.getPower());
        assertThat(savedSlot.getLatitude()).isEqualTo(slotDTO.getLatitude());
        assertThat(savedSlot.getLongitude()).isEqualTo(slotDTO.getLongitude());
    }

    @Test
    void whenUpdateExistingSlot_thenSuccess() {
        slotDTO.setId(1L);

        when(stationRepository.findByName("Test Station")).thenReturn(Optional.of(station));
        when(slotRepository.findById(1L)).thenReturn(Optional.of(slot));
        when(slotRepository.existsByNameAndIdNot("Test Slot", 1L)).thenReturn(false);
        when(slotRepository.save(any(Slot.class))).thenReturn(slot);

        Slot updatedSlot = slotService.saveOrUpdateSlotFromDTO(slotDTO);

        assertThat(updatedSlot.getId()).isEqualTo(slotDTO.getId());
        assertThat(updatedSlot.getName()).isEqualTo(slotDTO.getName());
        assertThat(updatedSlot.getStation().getName()).isEqualTo(slotDTO.getStationName());
    }

    @Test
    void whenSaveNewSlotWithExistingName_thenThrowException() {
        when(slotRepository.existsByName("Test Slot")).thenReturn(true);

        assertThatThrownBy(() -> slotService.saveOrUpdateSlotFromDTO(slotDTO))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Slot name already exists");
    }

    @Test
    void whenUpdateSlotWithNonExistingId_thenThrowException() {
        slotDTO.setId(999L);

        when(slotRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> slotService.saveOrUpdateSlotFromDTO(slotDTO))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Slot with given ID not found");
    }

    @Test
    void whenSaveSlotWithNewStation_thenCreateNewStation() {
        Station newStation = new Station();
        newStation.setName("New Station");

        Slot newSlot = new Slot();
        newSlot.setId(1L);
        newSlot.setName("Test Slot");
        newSlot.setStation(newStation);
        newSlot.setReserved(false);
        newSlot.setChargingType(ChargingType.FAST);
        newSlot.setPower("50.0");
        newSlot.setLatitude(40.6405);
        newSlot.setLongitude(-8.6538);

        when(stationRepository.findByName("New Station")).thenReturn(Optional.empty());
        when(stationRepository.save(any(Station.class))).thenReturn(newStation);
        when(slotRepository.existsByName("Test Slot")).thenReturn(false);
        when(slotRepository.save(any(Slot.class))).thenReturn(newSlot);

        slotDTO.setStationName("New Station");

        Slot savedSlot = slotService.saveOrUpdateSlotFromDTO(slotDTO);

        assertThat(savedSlot.getStation().getName()).isEqualTo("New Station");
    }

    @Test
    void getAllSlots_shouldReturnAllSlots() {
        List<Slot> expectedSlots = Collections.singletonList(slot);
        when(slotRepository.findAll()).thenReturn(expectedSlots);

        List<Slot> actualSlots = slotService.getAllSlots();

        assertThat(actualSlots).isEqualTo(expectedSlots);
    }

    @Test
    void getAvailableSlots_shouldReturnNonReservedSlots() {
        List<Slot> availableSlots = Collections.singletonList(slot);
        when(slotRepository.findByReservedFalse()).thenReturn(availableSlots);

        List<Slot> result = slotService.getAvailableSlots();

        assertThat(result).isEqualTo(availableSlots);
    }

    @Test
    void getSlotById_shouldReturnSlot() {
        when(slotRepository.findById(1L)).thenReturn(Optional.of(slot));

        Optional<Slot> result = slotService.getSlotById(1L);

        assertThat(result).isPresent()
                .contains(slot);
    }

    @Test
    void getSlotsByStationId_shouldReturnSlotsForStation() {
        List<Slot> allSlots = Collections.singletonList(slot);
        when(slotRepository.findAll()).thenReturn(allSlots);

        List<Slot> result = slotService.getSlotsByStationId(1L);

        assertThat(result).hasSize(1)
                .containsExactly(slot);
    }

    @Test
    void deleteSlot_shouldReturnTrueWhenExists() {
        when(slotRepository.existsById(1L)).thenReturn(true);

        boolean result = slotService.deleteSlot(1L);

        assertThat(result).isTrue();
        verify(slotRepository).deleteById(1L);
    }

    @Test
    void deleteSlot_shouldReturnFalseWhenNotExists() {
        when(slotRepository.existsById(1L)).thenReturn(false);

        boolean result = slotService.deleteSlot(1L);

        assertThat(result).isFalse();
        verify(slotRepository, never()).deleteById(any());
    }

    @Test
    void getTotalChargers_shouldReturnCount() {
        when(slotRepository.count()).thenReturn(1L);

        long result = slotService.getTotalChargers();

        assertThat(result).isEqualTo(1L);
    }

    @Test
    void getActiveChargers_shouldReturnNonReservedCount() {
        List<Slot> allSlots = Collections.singletonList(slot);
        when(slotRepository.findAll()).thenReturn(allSlots);

        long result = slotService.getActiveChargers();

        assertThat(result).isEqualTo(1L);
    }

    @Test
    void convertToResponseDTO_WithCoordinates_ShouldMapAllFields() {
        var responseDTO = slotService.convertToResponseDTO(slot);

        assertThat(responseDTO.getId()).isEqualTo(slot.getId());
        assertThat(responseDTO.getName()).isEqualTo(slot.getName());
        assertThat(responseDTO.getStationName()).isEqualTo(slot.getStation().getName());
        assertThat(responseDTO.isReserved()).isEqualTo(slot.isReserved());
        assertThat(responseDTO.getChargingType()).isEqualTo(slot.getChargingType());
        assertThat(responseDTO.getPower()).isEqualTo(slot.getPower());
        assertThat(responseDTO.getLatitude()).isEqualTo(slot.getLatitude());
        assertThat(responseDTO.getLongitude()).isEqualTo(slot.getLongitude());
        assertThat(responseDTO.getLocation()).isEqualTo(slot.getLatitude() + ", " + slot.getLongitude());
        assertThat(responseDTO.getPricePerKwh()).isEqualTo(slot.getChargingType().getPricePerKwh());
    }

    @Test
    void convertToResponseDTO_WithoutCoordinates_ShouldSetLocationUnknown() {
        slot.setLatitude(null);
        slot.setLongitude(null);

        var responseDTO = slotService.convertToResponseDTO(slot);

        assertThat(responseDTO.getLatitude()).isNull();
        assertThat(responseDTO.getLongitude()).isNull();
        assertThat(responseDTO.getLocation()).isEqualTo("Unknown");
    }
}
