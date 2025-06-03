Feature: Booking charger Management
  As a user of the EletricNET I want to be able to book a charger so that I can charge my electric vehicle

  Scenario Outline: Authenticated User
    Given I navigate to "http:/localhost"
    When I click on the "Sign Up" button
    And I enter "<name>" in the name field
    And I enter "<email>" in the email field
    And I enter "<password>" in the password field
    And I enter "<password>" in the confirm password field
    And I select "<role>" from the role dropdown
    And I click the register button
    Then I should be redirected to the login page and homepage should be visible
    Examples:
      | name        | email                 | password     | role  |
      | John Doe    | john.doe@example.com  | Password123! | USER  |
      | Alice Smith | alice.smith@gmail.com | Secret456!   | USER  |
      | Bob Brown   | bob.brown@hotmail.com | Secure789!   | ADMIN |

  Scenario: Admin creates a new charger
    Given I navigate to "http:/localhost"
    When I click on the "Sign In" button
    And I enter "admin@electricgo.com" in the email field
    And I enter "admin123!" in the password field
    And I click the "Sign In" button
    Then I should see the admin dashboard
    When I click on the "Add Charger" button
    And I enter "Fast Charger Porto" in the charger name field
    And I select "ULTRA_FAST" from the charging type dropdown
    And I enter "350" in the power field
    And I enter "41.1456" in the latitude field
    And I enter "-8.6116" in the longitude field
    And I enter "Porto Station" in the station name field
    And I click the "Save Charger" button
    Then I should see a success message "Charger created successfully"
    And the new charger should appear in the chargers list