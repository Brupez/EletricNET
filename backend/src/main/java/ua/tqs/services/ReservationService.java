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
import java.util.stream.Collectors;

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

        this.reservationErrors = Counter.builder("reservations.errors")
                .description("Number of failed reservation attempts")
                .register(meterRegistry);

        meterRegistry.gauge("reservations.current.total",
                reservationRepository,
                CrudRepository::count);

        meterRegistry.gauge("reservations.average.cost",
                reservationRepository,
                repo -> repo.findAll().stream()
                        .mapToDouble(Reservation::getTotalCost)
                        .average()
                        .orElse(0.0));
    }

    public Optional<ReservationResponseDTO> createReservation(ReservationRequestDTO dto) {
        try {
            return reservationCreationTimer.record(() -> {
                try {
                    Optional<User> userOpt = userRepository.findById(dto.getUserId());
                    Optional<Slot> slotOpt = slotRepository.findById(dto.getSlotId());

                    if (userOpt.isEmpty() || slotOpt.isEmpty()) {
                        reservationErrors.increment();
                        return Optional.empty();
                    }

                    Slot slot = slotOpt.get();
                    if (slot.isReserved()) {
                        reservationErrors.increment();
                        return Optional.empty();
                    }

                    slot.setReserved(true);
                    slotRepository.save(slot);

                    Station station = slot.getStation();
                    double discount = (station.isDiscountActive()) ? station.getDiscountValue() : 0.0;

                    Reservation reservation = new Reservation();
                    reservation.setUser(userOpt.get());
                    reservation.setSlot(slot);
                    reservation.setStatus(ReservationStatus.ACTIVE);
                    reservation.setCreationDate(LocalDateTime.now());
                    reservation.setStartTime(dto.getStartTime());
                    reservation.setStartDate(dto.getStartTime().toLocalDate());
                    reservation.setDurationMinutes(dto.getDurationMinutes());

                    reservation.setConsumptionKWh(dto.getConsumptionKWh());
                    double basePrice = dto.getPricePerKWh() * dto.getConsumptionKWh();
                    reservation.setTotalCost(basePrice * (1 - discount));
                    reservation.setPaid(false);

                    Reservation saved = reservationRepository.save(reservation);

                    totalReservations.increment();
                    activeReservations.increment();

                    ReservationResponseDTO response = new ReservationResponseDTO();
                    response.setId(saved.getId());
                    response.setUserId(saved.getUser().getId());
                    response.setSlotId(saved.getSlot().getId());
                    response.setState(saved.getStatus().name());
                    response.setConsumptionKWh(saved.getConsumptionKWh());
                    response.setTotalCost(saved.getTotalCost());
                    response.setPaid(saved.isPaid());
                    response.setStartTime(saved.getStartTime());
                    response.setDurationMinutes(saved.getDurationMinutes());
                    response.setStationName(slot.getStation().getName());
                    response.setChargingType(slot.getChargingType().name());
                    response.setCreatedAt(saved.getCreationDate());

                    meterRegistry.counter("reservations.by.station",
                            "station", slot.getStation().getName()).increment();

                    return Optional.of(response);
                } catch (Exception e) {
                    reservationErrors.increment();
                    return Optional.empty();
                }
            });
        } catch (Exception e) {
            reservationErrors.increment();
            return Optional.empty();
        }
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

        return reservations.stream().map(reservation -> {
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
            dto.setStartTime(reservation.getStartTime());
            dto.setDurationMinutes(reservation.getDurationMinutes());

            return dto;
        }).collect(Collectors.toList());
    }


    public double getTotalRevenue() {
        return reservationRepository.findAll().stream()
                .mapToDouble(Reservation::getTotalCost)
                .sum();
    }

    public List<ReservationResponseDTO> getAllReservations() {
        return reservationRepository.findAll().stream().map(reservation -> {
            ReservationResponseDTO dto = new ReservationResponseDTO();
            dto.setId(reservation.getId());
            dto.setUserId(reservation.getUser().getId());
            dto.setUserEmail(reservation.getUser().getEmail());
            dto.setUserName(reservation.getUser().getName());
            dto.setSlotId(reservation.getSlot().getId());
            dto.setState(reservation.getStatus().name());
            dto.setConsumptionKWh(reservation.getConsumptionKWh());
            dto.setTotalCost(reservation.getTotalCost());
            dto.setPaid(reservation.isPaid());
            dto.setStationName(reservation.getSlot().getStation().getName());
            dto.setChargingType(reservation.getSlot().getChargingType().name());
            dto.setCreatedAt(reservation.getCreationDate());
            return dto;
        }).collect(Collectors.toList());
    }

    public Optional<ReservationResponseDTO> getReservationById(Long id) {
        return reservationRepository.findById(id).map(reservation -> {
            ReservationResponseDTO dto = new ReservationResponseDTO();
            dto.setId(reservation.getId());
            dto.setUserId(reservation.getUser().getId());
            dto.setUserEmail(reservation.getUser().getEmail());
            dto.setUserName(reservation.getUser().getName());
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
        });
    }
}