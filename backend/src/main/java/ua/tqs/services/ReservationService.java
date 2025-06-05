package ua.tqs.services;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;
import ua.tqs.login.JwtUtil;
import ua.tqs.models.*;
import ua.tqs.enums.ReservationStatus;
import ua.tqs.repositories.ReservationRepository;
import ua.tqs.repositories.SlotRepository;
import ua.tqs.repositories.UserRepository;
import ua.tqs.dto.ReservationRequestDTO;
import ua.tqs.dto.ReservationResponseDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.function.Supplier;


@Service
public class ReservationService {
    private final MeterRegistry meterRegistry;
    private final ReservationRepository reservationRepository;
    private final SlotRepository slotRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final Counter totalReservations;
    private final Counter activeReservations;
    private final Counter canceledReservations;
    private final Timer reservationCreationTimer;
    private final Counter reservationErrors;

    @Autowired
    public ReservationService(MeterRegistry meterRegistry,
                            ReservationRepository reservationRepository,
                            SlotRepository slotRepository,
                            UserRepository userRepository,
                            JwtUtil jwtUtil) {
        this.meterRegistry = meterRegistry;
        this.reservationRepository = reservationRepository;
        this.slotRepository = slotRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;

        this.totalReservations = Counter.builder("reservations.total")
                .description("Total number of reservations")
                .register(meterRegistry);

        this.activeReservations = Counter.builder("reservations.active")
                .description("Number of active reservations")
                .register(meterRegistry);

        this.canceledReservations = Counter.builder("reservations.canceled")
                .description("Number of canceled reservations")
                .register(meterRegistry);

        this.reservationCreationTimer = Timer.builder("reservation.creation.time")
                .description("Time taken to create a reservation")
                .register(meterRegistry);

        this.reservationErrors = Counter.builder("reservations.errors")
                .description("Number of failed reservation attempts")
                .register(meterRegistry);

        meterRegistry.gauge("reservations.current.total",
                reservationRepository,
                CrudRepository::count);
    }

    private ReservationResponseDTO mapToDTO(Reservation reservation, boolean includeUserDetails) {
        ReservationResponseDTO dto = new ReservationResponseDTO();
        dto.setId(reservation.getId());
        dto.setUserId(reservation.getUser().getId());
        dto.setSlotId(reservation.getSlot().getId());
        dto.setState(reservation.getStatus().name());
        dto.setConsumptionKWh(reservation.getConsumptionKWh());
        dto.setTotalCost(reservation.getTotalCost());
        dto.setPaid(reservation.isPaid());
        dto.setStationName(reservation.getSlot().getStation().getName());
        dto.setChargingType(reservation.getSlot().getChargingType().name());
        dto.setCreatedAt(reservation.getCreationDate());
        dto.setStartTime(reservation.getStartTime());
        dto.setDurationMinutes(reservation.getDurationMinutes());

        if (includeUserDetails) {
            dto.setUserEmail(reservation.getUser().getEmail());
            dto.setUserName(reservation.getUser().getName());
        }

        return dto;
    }

    private Optional<ReservationResponseDTO> handleReservationError() {
        reservationErrors.increment();
        return Optional.empty();
    }

    public Optional<ReservationResponseDTO> createReservation(ReservationRequestDTO dto) {
        return wrapWithTimer(() -> processReservationCreation(dto));
    }

    private Optional<ReservationResponseDTO> wrapWithTimer(Supplier<Optional<ReservationResponseDTO>> operation) {
        try {
            return reservationCreationTimer.record(operation);
        } catch (Exception e) {
            return handleReservationError();
        }
    }

    private Optional<ReservationResponseDTO> processReservationCreation(ReservationRequestDTO dto) {
        try {
            Optional<User> userOpt = userRepository.findById(dto.getUserId());
            Optional<Slot> slotOpt = slotRepository.findById(dto.getSlotId());

            if (userOpt.isEmpty() || slotOpt.isEmpty()) {
                return handleReservationError();
            }

            Slot slot = slotOpt.get();
            if (slot.isReserved()) {
                return handleReservationError();
            }

            slot.setReserved(true);
            slotRepository.save(slot);

            Reservation reservation = createReservationEntity(dto, userOpt.get(), slot);
            Reservation saved = reservationRepository.save(reservation);

            totalReservations.increment();
            activeReservations.increment();

            ReservationResponseDTO response = mapToDTO(saved, false);

            meterRegistry.counter("reservations.by.station",
                    "station", slot.getStation().getName()).increment();

            return Optional.of(response);
        } catch (Exception e) {
            return handleReservationError();
        }
    }

    private Reservation createReservationEntity(ReservationRequestDTO dto, User user, Slot slot) {
        Station station = slot.getStation();
        double discount = (station.isDiscountActive()) ? station.getDiscountValue() : 0.0;
        double basePrice = dto.getPricePerKWh() * dto.getConsumptionKWh();

        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setSlot(slot);
        reservation.setStatus(ReservationStatus.ACTIVE);
        reservation.setCreationDate(LocalDateTime.now());
        reservation.setStartTime(dto.getStartTime());
        reservation.setStartDate(dto.getStartTime().toLocalDate());
        reservation.setDurationMinutes(dto.getDurationMinutes());
        reservation.setConsumptionKWh(dto.getConsumptionKWh());
        reservation.setTotalCost(basePrice * (1 - discount));
        reservation.setPaid(false);

        return reservation;
    }

    public boolean cancelReservation(Long reservationId) {
        Optional<Reservation> reservationOpt = reservationRepository.findById(reservationId);

        if (reservationOpt.isEmpty() ||
            reservationOpt.get().getStatus() != ReservationStatus.ACTIVE) {
            return false;
        }

        Reservation reservation = reservationOpt.get();
        Slot slot = reservation.getSlot();
        slot.setReserved(false);
        slotRepository.save(slot);

        reservation.setStatus(ReservationStatus.CANCELED);
        reservationRepository.save(reservation);

        activeReservations.increment(-1);
        canceledReservations.increment();

        return true;
    }

    public List<ReservationResponseDTO> getReservationsByToken(String token) {
        String email = jwtUtil.getUsername(token);
        Optional<User> userOpt = userRepository.findByEmail(email);

        return userOpt.map(user -> reservationRepository.findByUser(user).stream()
                .map(reservation -> mapToDTO(reservation, false))
                .toList()).orElseGet(List::of);
    }

    public double getTotalRevenue() {
        return reservationRepository.findAll().stream()
                .mapToDouble(Reservation::getTotalCost)
                .sum();
    }

    public List<ReservationResponseDTO> getAllReservations() {
        return reservationRepository.findAll().stream()
                .map(reservation -> mapToDTO(reservation, true))
                .toList();
    }

    public Optional<ReservationResponseDTO> getReservationById(Long id) {
        return reservationRepository.findById(id)
                .map(reservation -> mapToDTO(reservation, true));
    }
}