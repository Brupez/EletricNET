Feature: Booking charger Management
  As a user of the EletricNET I want to be able to book a charger so that I can charge my electric vehicle

  Scenario Outline: Authenticated User
    Given I navigate to "http:/localhost"
    When I click on the "Sign Up" button
    And I enter "<name>" in the name field
    And I enter "<email>" in the email field
    And I enter "<password>" in the password field
    And I enter "<password>" in the confirm password field
    And I click the register button
    Then I should be redirected to the login page and homepage should be visible
    Examples:
      | name        | email                 | password     |
      | John Doe    | john.doe@example.com  | Password123! |
      | Alice Smith | alice.smith@gmail.com | Secret456!   |
      | Bob Brown   | bob.brown@hotmail.com | Secure789!   |

