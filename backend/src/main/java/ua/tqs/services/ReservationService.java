package ua.tqs.services;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.beans.factory.annotation.Autowired;
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

        // Initialize grafana metrics
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
    }

    public Optional<ReservationResponseDTO> createReservation(ReservationRequestDTO dto) {
        return reservationCreationTimer.record(() -> {
            try {
                Optional<User> userOpt = userRepository.findById(dto.getUserId());
                Optional<Slot> slotOpt = slotRepository.findById(dto.getSlotId());

                if (userOpt.isEmpty() || slotOpt.isEmpty()) {
                    return Optional.empty();
                }

                Slot slot = slotOpt.get();
                if (slot.isReserved()) {
                    return Optional.empty();
                }

                slot.setReserved(true);
                slotRepository.save(slot);

                Station station = slot.getStation();
                double discount = station.isDiscountActive() ? station.getDiscountValue() : 0.0;

                Reservation reservation = new Reservation();
                reservation.setUser(userOpt.get());
                reservation.setSlot(slot);
                reservation.setStatus(ReservationStatus.ACTIVE);
                reservation.setCreationDate(LocalDateTime.now());
                reservation.setStartTime(dto.getStartTime());
                reservation.setDurationMinutes(dto.getDurationMinutes());
                reservation.setConsumptionKWh(dto.getConsumptionKWh());

                double basePrice = dto.getPricePerKWh() * dto.getConsumptionKWh();
                reservation.setTotalCost(basePrice * (1 - discount));
                reservation.setPaid(false);

                Reservation saved = reservationRepository.save(reservation);
                totalReservations.increment();
                activeReservations.increment();

                return Optional.of(mapToResponseDTO(saved));
            } catch (Exception e) {
                meterRegistry.counter("reservations.errors").increment();
                return Optional.empty();
            }
        });
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

        if (userOpt.isEmpty()) {
            return List.of();
        }

        List<Reservation> reservations = reservationRepository.findByUser(userOpt.get());
        return reservations.stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    public double getTotalRevenue() {
        return reservationRepository.findAll().stream()
                .mapToDouble(Reservation::getTotalCost)
                .sum();
    }

    public List<ReservationResponseDTO> getAllReservations() {
        return reservationRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    private ReservationResponseDTO mapToResponseDTO(Reservation reservation) {
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
        return dto;
    }
}