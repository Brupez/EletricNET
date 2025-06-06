package services;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ua.tqs.dto.ReservationRequestDTO;
import ua.tqs.dto.ReservationResponseDTO;
import ua.tqs.enums.ChargingType;
import ua.tqs.enums.ReservationStatus;
import ua.tqs.login.JwtUtil;
import ua.tqs.models.Reservation;
import ua.tqs.models.Slot;
import ua.tqs.models.Station;
import ua.tqs.models.User;
import ua.tqs.repositories.ReservationRepository;
import ua.tqs.repositories.SlotRepository;
import ua.tqs.repositories.UserRepository;
import ua.tqs.services.ReservationService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private SlotRepository slotRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtil jwtUtil;

    private ReservationService reservationService;

    private User user;
    private Slot slot;
    private Station station;
    private Reservation reservation;
    private ReservationRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        MeterRegistry meterRegistry = new SimpleMeterRegistry();

        reservationService = new ReservationService(
                meterRegistry,
                reservationRepository,
                slotRepository,
                userRepository,
                jwtUtil
        );

        user = new User();
        user.setId(1L);
        user.setEmail("test@test.com");

        station = new Station();
        station.setId(1L);
        station.setName("Test Station");
        station.setDiscountValue(0.1);

        slot = new Slot();
        slot.setId(1L);
        slot.setStation(station);
        slot.setChargingType(ChargingType.FAST);
        slot.setReserved(false);

        reservation = new Reservation();
        reservation.setId(1L);
        reservation.setUser(user);
        reservation.setSlot(slot);
        reservation.setStatus(ReservationStatus.ACTIVE);
        reservation.setConsumptionKWh(10.0);
        reservation.setTotalCost(45.0);
        reservation.setPaid(false);
        reservation.setCreationDate(LocalDateTime.now());
        reservation.setStartTime(LocalDateTime.now().plusHours(1));
        reservation.setDurationMinutes(60);

        requestDTO = new ReservationRequestDTO();
        requestDTO.setUserId(1L);
        requestDTO.setSlotId(1L);
        requestDTO.setStartTime(LocalDateTime.now().plusHours(1));
        requestDTO.setDurationMinutes(60);
        requestDTO.setConsumptionKWh(10.0);
        requestDTO.setPricePerKWh(5.0);
    }

    @Test
    void createReservation_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(slotRepository.findById(1L)).thenReturn(Optional.of(slot));
        when(slotRepository.save(any(Slot.class))).thenReturn(slot);
        when(reservationRepository.save(any(Reservation.class))).thenReturn(reservation);

        Optional<ReservationResponseDTO> result = reservationService.createReservation(requestDTO);

        assertThat(result).isPresent();
        assertThat(result.get().getUserId()).isEqualTo(user.getId());
        assertThat(result.get().getSlotId()).isEqualTo(slot.getId());
        verify(slotRepository).save(argThat(Slot::isReserved));
    }

    @Test
    void createReservation_SlotAlreadyReserved_ReturnEmpty() {
        slot.setReserved(true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(slotRepository.findById(1L)).thenReturn(Optional.of(slot));
        when(slotRepository.existsByIdAndReservedTrue(1L)).thenReturn(true);


        Optional<ReservationResponseDTO> result = reservationService.createReservation(requestDTO);

        assertThat(result).isEmpty();
        verify(slotRepository, never()).save(any());
        verify(reservationRepository, never()).save(any());
    }

    @Test
    void cancelReservation_Success() {
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
        when(slotRepository.save(any(Slot.class))).thenReturn(slot);
        when(reservationRepository.save(any(Reservation.class))).thenReturn(reservation);

        boolean result = reservationService.cancelReservation(1L);

        assertThat(result).isTrue();
        verify(slotRepository).save(argThat(s -> !s.isReserved()));
        verify(reservationRepository).save(argThat(r -> r.getStatus() == ReservationStatus.CANCELED));
    }

    @Test
    void cancelReservation_NonExistentReservation_ReturnFalse() {
        when(reservationRepository.findById(1L)).thenReturn(Optional.empty());

        boolean result = reservationService.cancelReservation(1L);

        assertThat(result).isFalse();
        verify(slotRepository, never()).save(any());
    }

    @Test
    void getReservationById_Success() {
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));

        Optional<ReservationResponseDTO> result = reservationService.getReservationById(1L);

        assertThat(result).isPresent();
        ReservationResponseDTO dto = result.get();
        assertThat(dto.getId()).isEqualTo(reservation.getId());
        assertThat(dto.getUserId()).isEqualTo(user.getId());
        assertThat(dto.getUserEmail()).isEqualTo(user.getEmail());
        assertThat(dto.getSlotId()).isEqualTo(slot.getId());
        assertThat(dto.getStationLocation()).isEqualTo(station.getName());
        assertThat(dto.getChargingType()).isEqualTo(slot.getChargingType().name());
        assertThat(dto.getStartTime()).isEqualTo(reservation.getStartTime());
        assertThat(dto.getDurationMinutes()).isEqualTo(reservation.getDurationMinutes());
    }

    @Test
    void getReservationById_NotFound_ReturnEmpty() {
        when(reservationRepository.findById(1L)).thenReturn(Optional.empty());

        Optional<ReservationResponseDTO> result = reservationService.getReservationById(1L);

        assertThat(result).isEmpty();
    }

    @Test
    void getReservationsByToken_Success() {
        when(jwtUtil.getUsername("token")).thenReturn("test@test.com");
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(reservationRepository.findByUser(user)).thenReturn(List.of(reservation));

        List<ReservationResponseDTO> result = reservationService.getReservationsByToken("token");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUserId()).isEqualTo(user.getId());
        assertThat(result.get(0).getSlotId()).isEqualTo(slot.getId());
    }

    @Test
    void getReservationsByToken_UserNotFound_ReturnEmptyList() {
        when(jwtUtil.getUsername("token")).thenReturn("test@test.com");
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.empty());

        List<ReservationResponseDTO> result = reservationService.getReservationsByToken("token");

        assertThat(result).isEmpty();
    }

    @Test
    void getTotalRevenue_Success() {
        when(reservationRepository.findAll()).thenReturn(List.of(reservation));

        double result = reservationService.getTotalRevenue();

        assertThat(result).isEqualTo(45.0);
    }

    @Test
    void getAllReservations_Success() {
        when(reservationRepository.findAll()).thenReturn(List.of(reservation));

        List<ReservationResponseDTO> result = reservationService.getAllReservations();

        assertThat(result).hasSize(1);
        ReservationResponseDTO dto = result.get(0);
        assertThat(dto.getId()).isEqualTo(reservation.getId());
        assertThat(dto.getUserId()).isEqualTo(user.getId());
        assertThat(dto.getSlotId()).isEqualTo(slot.getId());
        assertThat(dto.getStationLocation()).isEqualTo(station.getName());
        assertThat(dto.getChargingType()).isEqualTo(slot.getChargingType().name());
    }

    @Test
    void createReservation_UserNotFound_ReturnEmpty() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        Optional<ReservationResponseDTO> result = reservationService.createReservation(requestDTO);

        assertThat(result).isEmpty();
        verify(slotRepository, never()).save(any());
        verify(reservationRepository, never()).save(any());
    }

    @Test
    void createReservation_SlotNotFound_ReturnEmpty() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(slotRepository.findById(1L)).thenReturn(Optional.empty());

        Optional<ReservationResponseDTO> result = reservationService.createReservation(requestDTO);

        assertThat(result).isEmpty();
        verify(slotRepository, never()).save(any());
        verify(reservationRepository, never()).save(any());
    }

    @Test
    void createReservation_ThrowsException_ReturnEmpty() {
        MeterRegistry registry = new SimpleMeterRegistry();

        ReservationService testService = new ReservationService(
                registry,
                reservationRepository,
                slotRepository,
                userRepository,
                jwtUtil
        );

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(slotRepository.findById(1L)).thenReturn(Optional.of(slot));
        when(slotRepository.save(any(Slot.class))).thenThrow(new RuntimeException("Database error"));

        Optional<ReservationResponseDTO> result = testService.createReservation(requestDTO);

        assertThat(result).isEmpty();
        verify(slotRepository).save(any());
        assertThat(registry.counter("reservations.errors").count()).isEqualTo(1.0);
    }
}
