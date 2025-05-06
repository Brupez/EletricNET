package ua.tqs.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ua.tqs.models.*;
import ua.tqs.enums.ReservationStatus;
import ua.tqs.repositories.ReservationRepository;
import ua.tqs.repositories.SlotRepository;
import ua.tqs.repositories.StationRepository;
import ua.tqs.repositories.UserRepository;
import ua.tqs.dto.ReservationRequestDTO;
import ua.tqs.dto.ReservationResponseDTO;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private SlotRepository slotRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StationRepository stationRepository;

    public Optional<ReservationResponseDTO> createReservation(ReservationRequestDTO dto) {
        Optional<User> userOpt = userRepository.findById(dto.getUserId());
        Optional<Slot> slotOpt = slotRepository.findById(dto.getSlotId());

        if (userOpt.isEmpty() || slotOpt.isEmpty()) return Optional.empty();

        Slot slot = slotOpt.get();
        if (slot.isReserved()) return Optional.empty();

        slot.setReserved(true);
        slotRepository.save(slot);

        Station station = slot.getStation();
        double discount = (station.isDiscountActive()) ? station.getDiscountValue() : 0.0;

        Reservation reservation = new Reservation();
        reservation.setUser(userOpt.get());
        reservation.setSlot(slot);
        reservation.setStatus(ReservationStatus.ACTIVE);
        reservation.setCreationDate(LocalDateTime.now());

        reservation.setConsumptionKWh(dto.getConsumptionKWh());
        double basePrice = dto.getPricePerKWh() * dto.getConsumptionKWh();
        reservation.setTotalCost(basePrice * (1 - discount));
        reservation.setPaid(false);

        Reservation saved = reservationRepository.save(reservation);

        ReservationResponseDTO response = new ReservationResponseDTO();
        response.setId(saved.getId());
        response.setUserId(saved.getUser().getId());
        response.setSlotId(saved.getSlot().getId());
        response.setState(saved.getStatus().name());
        response.setConsumptionKWh(saved.getConsumptionKWh());
        response.setTotalCost(saved.getTotalCost());
        response.setPaid(saved.isPaid());

        return Optional.of(response);
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
}
