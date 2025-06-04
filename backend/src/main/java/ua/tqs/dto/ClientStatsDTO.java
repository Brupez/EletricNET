package ua.tqs.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class ClientStatsDTO {
    private double totalEnergy;
    private double totalCost;
    private double currentMonthCost;
    private int reservationCount;
    private double averageDuration;
    private String mostUsedStation;

    private List<WeeklyConsumption> weeklyConsumption;
    private Map<String, Long> chargingTypeCounts;
    private Map<String, Long> reservationsPerSlot;

    @Data
    public static class WeeklyConsumption {
        private String weekStart;
        private double kWh;

        public WeeklyConsumption(String weekStart, double kWh) {
            this.weekStart = weekStart;
            this.kWh = kWh;
        }
    }
}
