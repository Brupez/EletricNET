package ua.tqs.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class ClientStatsDTO {
    private double totalEnergy;
    private double totalCost;
    private int reservationCount;
    private double averageDuration;
    private String mostUsedStation;
    private List<MonthlyConsumption> monthlyConsumption;

    private Map<String, Long> chargingTypeCounts;
    private Map<String, Long> reservationsPerSlot;

    @Data
    public static class MonthlyConsumption {
        private String month;
        private double kWh;

        public MonthlyConsumption(String month, double kWh) {
            this.month = month;
            this.kWh = kWh;
        }
    }
}
