Feature: Booking charger Management
  As a user of the EletricNET I want to be able to book a charger so that I can charge my electric vehicle

  Background:
    Given I am authenticated as a registered user at "http://localhost"

  Scenario: Successfully create a new reservation
    When I enter "Aveiro" in search bar for charging stations
    Then I choose the "
    And the slot should be marked as reserved
    And I should receive the reservation details with status "ACTIVE"
