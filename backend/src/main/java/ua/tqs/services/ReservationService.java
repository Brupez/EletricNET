package ua.tqs.services;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ua.tqs.dto.ClientStatsDTO;
import ua.tqs.login.JwtUtil;
import ua.tqs.models.*;
import ua.tqs.enums.ReservationStatus;
import ua.tqs.repositories.ReservationRepository;
import ua.tqs.repositories.SlotRepository;
import ua.tqs.repositories.UserRepository;
import ua.tqs.dto.ReservationRequestDTO;
import ua.tqs.dto.ReservationResponseDTO;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

import java.time.LocalDateTime;

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
                                if (userOpt.isEmpty()) {
                                        return Optional.empty();
                                }

                                Optional<Slot> slotOpt = slotRepository.findById(dto.getSlotId());
                                if (slotOpt.isEmpty()) {
                                        return Optional.empty();
                                }

                                Slot slot = slotOpt.get();

                                LocalDateTime newStart = dto.getStartTime();
                                LocalDateTime newEnd = newStart.plusMinutes(dto.getDurationMinutes());

                                List<Reservation> existing = reservationRepository.findBySlot_IdAndStatus(dto.getSlotId(), ReservationStatus.ACTIVE);
                                boolean overlaps = existing.stream().anyMatch(r -> {
                                        LocalDateTime existingStart = r.getStartTime();
                                        LocalDateTime existingEnd = existingStart.plusMinutes(r.getDurationMinutes());
                                        return !(existingEnd.isBefore(newStart) || existingStart.isAfter(newEnd));
                                });

                                if (overlaps) {
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
                                reservation.setStartDate(dto.getStartTime().toLocalDate());
                                reservation.setDurationMinutes(dto.getDurationMinutes());
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
                                response.setStartTime(saved.getStartTime());
                                response.setDurationMinutes(saved.getDurationMinutes());
                                response.setStationLocation(slot.getStation().getName());
                                response.setSlotLabel(slot.getName());
                                response.setChargingType(slot.getChargingType().name());
                                response.setCreatedAt(saved.getCreationDate());

                                return Optional.of(response);
                        } catch (Exception e) {
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

                return reservations.stream().map(reservation -> {
                        ReservationResponseDTO dto = new ReservationResponseDTO();
                        dto.setId(reservation.getId());
                        dto.setUserId(reservation.getUser().getId());
                        dto.setSlotId(reservation.getSlot().getId());
                        dto.setState(reservation.getStatus().name());
                        dto.setConsumptionKWh(reservation.getConsumptionKWh());
                        dto.setTotalCost(reservation.getTotalCost());
                        dto.setPaid(reservation.isPaid());
                        dto.setStationLocation(reservation.getSlot().getStation().getName());
                        dto.setSlotLabel(reservation.getSlot().getName());
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
                        dto.setStationLocation(reservation.getSlot().getStation().getName());
                        dto.setSlotLabel(reservation.getSlot().getName());
                        dto.setChargingType(reservation.getSlot().getChargingType().name());
                        dto.setCreatedAt(reservation.getCreationDate());
                        dto.setStartTime(reservation.getStartTime());
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
                        dto.setStationLocation(reservation.getSlot().getStation().getName());
                        dto.setSlotLabel(reservation.getSlot().getName());
                        dto.setChargingType(reservation.getSlot().getChargingType().name());
                        dto.setCreatedAt(reservation.getCreationDate());
                        dto.setStartTime(reservation.getStartTime());
                        dto.setDurationMinutes(reservation.getDurationMinutes());
                        return dto;
                });
        }

        public List<ReservationResponseDTO> getActiveReservationsBySlotId(Long slotId) {
                List<Reservation> reservations = reservationRepository.findBySlot_IdAndStatus(slotId,
                                ReservationStatus.ACTIVE);

                LocalDateTime now = LocalDateTime.now();
                List<Reservation> futureOrCurrent = reservations.stream()
                                .filter(r -> {
                                        LocalDateTime start = r.getStartTime();
                                        int duration = r.getDurationMinutes() != null ? r.getDurationMinutes() : 0;
                                        LocalDateTime end = start.plusMinutes(duration);
                                        return end.isAfter(now);
                                })
                                .toList();

                return futureOrCurrent.stream().map(reservation -> {
                        ReservationResponseDTO dto = new ReservationResponseDTO();
                        dto.setId(reservation.getId());
                        dto.setUserId(reservation.getUser().getId());
                        dto.setUserName(reservation.getUser().getName());
                        dto.setUserEmail(reservation.getUser().getEmail());
                        dto.setStartTime(reservation.getStartTime());
                        dto.setDurationMinutes(reservation.getDurationMinutes());
                        dto.setConsumptionKWh(reservation.getConsumptionKWh());
                        dto.setTotalCost(reservation.getTotalCost());
                        dto.setPaid(reservation.isPaid());
                        dto.setSlotLabel(reservation.getSlot().getName());
                        return dto;
                }).toList();
        }

        public ClientStatsDTO getClientStats(String token) {
                String email = jwtUtil.getUsername(token);
                Optional<User> userOpt = userRepository.findByEmail(email);
                if (userOpt.isEmpty())
                        return null;

                List<Reservation> reservations = reservationRepository.findByUser(userOpt.get());

                YearMonth currentMonth = YearMonth.now();
                double currentMonthCost = reservations.stream()
                                .filter(r -> r.getStartTime() != null &&
                                                YearMonth.from(r.getStartTime().toLocalDate()).equals(currentMonth))
                                .mapToDouble(r -> r.getTotalCost() != null ? r.getTotalCost() : 0)
                                .sum();

                double totalEnergy = reservations.stream()
                                .mapToDouble(r -> r.getConsumptionKWh() != null ? r.getConsumptionKWh() : 0)
                                .sum();

                double totalCost = reservations.stream()
                                .mapToDouble(r -> r.getTotalCost() != null ? r.getTotalCost() : 0)
                                .sum();

                int count = reservations.size();

                double avgDuration = reservations.stream()
                                .mapToInt(r -> r.getDurationMinutes() != null ? r.getDurationMinutes() : 0)
                                .average().orElse(0);

                Map<String, Long> stationUsage = reservations.stream()
                                .filter(r -> r.getSlot() != null && r.getSlot().getStation() != null)
                                .collect(Collectors.groupingBy(
                                                r -> r.getSlot().getStation().getName(),
                                                Collectors.counting()));

                String mostUsed = stationUsage.entrySet().stream()
                                .max(Map.Entry.comparingByValue())
                                .map(Map.Entry::getKey)
                                .orElse("—");

                Map<String, Double> kWhPerWeek = reservations.stream()
                                .filter(r -> r.getStartTime() != null && r.getConsumptionKWh() != null)
                                .collect(Collectors.groupingBy(
                                                r -> {
                                                        LocalDate start = r.getStartTime().toLocalDate();
                                                        WeekFields weekFields = WeekFields.of(DayOfWeek.MONDAY, 1);
                                                        LocalDate weekStart = start
                                                                        .with(weekFields.getFirstDayOfWeek());
                                                        return weekStart.toString();
                                                },
                                                Collectors.summingDouble(Reservation::getConsumptionKWh)));

                List<ClientStatsDTO.WeeklyConsumption> weekly = kWhPerWeek.entrySet().stream()
                                .map(e -> new ClientStatsDTO.WeeklyConsumption(e.getKey(), e.getValue()))
                                .sorted(Comparator.comparing(ClientStatsDTO.WeeklyConsumption::getWeekStart))
                                .toList();

                // Para retornar dados mensais
                /*
                 * Map<String, Double> kWhPerMonth = reservations.stream()
                 * .filter(r -> r.getStartTime() != null && r.getConsumptionKWh() != null)
                 * .collect(Collectors.groupingBy(
                 * r -> r.getStartTime().getMonth().toString().substring(0, 3) + "/" +
                 * r.getStartTime().getYear(),
                 * Collectors.summingDouble(Reservation::getConsumptionKWh)
                 * ));
                 * 
                 * List<ClientStatsDTO.MonthlyConsumption> monthly =
                 * kWhPerMonth.entrySet().stream()
                 * .map(e -> new ClientStatsDTO.MonthlyConsumption(e.getKey(), e.getValue()))
                 * .sorted(Comparator.comparing(ClientStatsDTO.MonthlyConsumption::getMonth))
                 * .toList();
                 */

                Map<String, Long> chargingTypeCounts = reservations.stream()
                                .filter(r -> r.getSlot() != null)
                                .collect(Collectors.groupingBy(
                                                r -> r.getSlot().getChargingType().toString(),
                                                Collectors.counting()));

                Map<String, Long> reservationsPerSlot = reservations.stream()
                                .filter(r -> r.getSlot() != null)
                                .collect(Collectors.groupingBy(
                                                r -> r.getSlot().getName(),
                                                Collectors.counting()));

                ClientStatsDTO dto = new ClientStatsDTO();
                dto.setTotalEnergy(totalEnergy);
                dto.setTotalCost(totalCost);
                dto.setCurrentMonthCost(currentMonthCost);
                dto.setReservationCount(count);
                dto.setAverageDuration(avgDuration);
                dto.setMostUsedStation(mostUsed);
                dto.setWeeklyConsumption(weekly);
                // dto.setMonthlyConsumption(monthly); // dados mensais
                dto.setChargingTypeCounts(chargingTypeCounts);
                dto.setReservationsPerSlot(reservationsPerSlot);

                return dto;
        }

        public double getCurrentMonthRevenue() {
                YearMonth currentMonth = YearMonth.now();

                return reservationRepository.findAll().stream()
                                .filter(r -> r.getStartTime() != null &&
                                                YearMonth.from(r.getStartTime().toLocalDate()).equals(currentMonth))
                                .mapToDouble(r -> r.getTotalCost() != null ? r.getTotalCost() : 0)
                                .sum();
        }
}