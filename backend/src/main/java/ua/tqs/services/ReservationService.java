package ua.tqs.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import java.util.List;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ReservationService {
    private static final Logger logger = LoggerFactory.getLogger(ReservationService.class);

    private final ReservationRepository reservationRepository;
    private final SlotRepository slotRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Autowired
    public ReservationService(ReservationRepository reservationRepository,
                              SlotRepository slotRepository,
                              UserRepository userRepository,
                              JwtUtil jwtUtil) {
        this.reservationRepository = reservationRepository;
        this.slotRepository = slotRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    public Optional<ReservationResponseDTO> createReservation(ReservationRequestDTO dto) {
        logger.info("Received reservation request: {}", dto);
        Optional<User> userOpt = userRepository.findById(dto.getUserId());
        if (userOpt.isEmpty()) {
            logger.info("User not found: {}", dto.getUserId());
            return Optional.empty();
        }

        Optional<Slot> slotOpt = slotRepository.findById(dto.getSlotId());
        if (slotOpt.isEmpty()) {
            logger.info("Slot not found: {}", dto.getSlotId());
            return Optional.empty();
        }

        Slot slot = slotOpt.get();
        if (slot.isReserved()) {
            logger.info("Slot {} is already reserved", dto.getSlotId());
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
        reservation.setDurationMinutes(dto.getDurationMinutes());
        reservation.setConsumptionKWh(dto.getConsumptionKWh());
        double basePrice = dto.getPricePerKWh() * dto.getConsumptionKWh();
        reservation.setTotalCost(basePrice * (1 - discount));
        reservation.setPaid(false);

        Reservation saved = reservationRepository.save(reservation);
        ReservationResponseDTO response = createResponseDTO(saved);

        logger.info("Created reservation with ID: {}", saved.getId());
        return Optional.of(response);
    }

    private ReservationResponseDTO createResponseDTO(Reservation saved) {
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
        response.setStationName(saved.getSlot().getStation().getName());
        response.setChargingType(saved.getSlot().getChargingType().name());
        response.setCreatedAt(saved.getCreationDate());
        return response;
    }

    public boolean cancelReservation(Long reservationId) {
        Optional<Reservation> reservationOpt = reservationRepository.findById(reservationId);

        if (reservationOpt.isEmpty()) return false;

        Reservation reservation = reservationOpt.get();
        if (reservation.getStatus() != ReservationStatus.ACTIVE) return false;

        Slot slot = reservation.getSlot();
        slot.setReserved(false);
        slotRepository.save(slot);

        reservation.setStatus(ReservationStatus.CANCELED);
        reservationRepository.save(reservation);
        return true;
    }

    public List<ReservationResponseDTO> getReservationsByToken(String token) {
        String email = jwtUtil.getUsername(token);
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            logger.info("User not found for email: {}", email);
            return List.of();
        }

        List<Reservation> reservations = reservationRepository.findByUser(userOpt.get());
        return reservations.stream()
                .map(this::createResponseDTO)
                .toList();
    }

    public double getTotalRevenue() {
        double total = reservationRepository.findAll().stream()
                .mapToDouble(Reservation::getTotalCost)
                .sum();
        logger.info("Total revenue calculated: {}", total);
        return total;
    }

    public List<ReservationResponseDTO> getAllReservations() {
        List<ReservationResponseDTO> reservations = reservationRepository.findAll().stream()
                .map(this::createResponseDTO)
                .toList();
        logger.info("Retrieved {} reservations", reservations.size());
        return reservations;
    }
}