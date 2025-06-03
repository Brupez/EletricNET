package functional;

import com.microsoft.playwright.*;
import com.microsoft.playwright.options.AriaRole;
import io.cucumber.java.After;
import io.cucumber.java.Before;
import io.cucumber.java.en.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class BookingStationSteps {
    private static final Logger logger = LoggerFactory.getLogger(BookingStationSteps.class);
    private Playwright playwright;
    private Browser browser;
    private Page page;

    @Before
    public void setUp() {
        logger.info("Initializing Playwright...");
        playwright = Playwright.create();

        BrowserType.LaunchOptions launchOptions = new BrowserType.LaunchOptions()
                .setHeadless(true);

        browser = playwright.chromium().launch(launchOptions);


        Browser.NewContextOptions contextOptions = new Browser.NewContextOptions()
                .setViewportSize(1920, 1080)
                .setIgnoreHTTPSErrors(true);

        logger.info("Creating new browser context with cleared state...");
        BrowserContext context = browser.newContext(contextOptions);

        context.clearCookies();
        context.clearPermissions();

        page = context.newPage();
    }

    @Given("I navigate to {string}")
    public void iNavigateTo(String url) {
        try {
            logger.info("Creating new browser context...");
            BrowserContext context = browser.newContext();
            page = context.newPage();

            logger.info("Navigating to URL: {}", url);
            page.navigate(url);
            logger.info("Navigation completed successfully");

        } catch (Exception e) {
            logger.error("Error during navigation: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to navigate: " + e.getMessage(), e);
        }
    }

    @When("I click on the {string} button")
    public void iClickOnTheButton(String buttonText) {
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName(buttonText)).click();
    }

    @When("I enter {string} in the name field")
    public void iEnterInTheNameField(String name) {
        page.getByLabel("Name").fill(name);
    }

    @When("I enter {string} in the email field")
    public void iEnterInTheEmailField(String email) {
        page.getByLabel("Email").fill(email);
    }

    @When("I enter {string} in the password field")
    public void iEnterInThePasswordField(String password) {
        page.locator("#password").fill(password);
    }

    @When("I enter {string} in the confirm password field")
    public void iEnterInTheConfirmPasswordField(String password) {
        page.locator("#confirmPassword").fill(password);
    }

    @And("I select {string} from the role dropdown")
    public void iSelectFromTheRoleDropdown(String role) {
        Locator roleDropdown = page.getByRole(AriaRole.COMBOBOX, new Page.GetByRoleOptions().setName("Role"));
        roleDropdown.selectOption(role);
    }

    @When("I click the register button")
    public void iClickTheRegisterButton() {
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Sign Up")).click();
    }

    @Then("I should be redirected to the login page and homepage should be visible")
    public void iShouldBeRedirectedToTheLoginPage() {
        page.waitForURL("**/login");
        assertTrue(page.url().contains("/login"), "URL should contain '/login'");

        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Sign In")).click();
    }

    // Add Charger Admin Side

    @Then("I should see the admin dashboard")
    public void iShouldSeeTheAdminDashboard() {
        page.waitForURL("**/admin");
        assertTrue(page.url().contains("/admin"), "URL should contain '/admin'");
    }

    @When("I enter {string} in the charger name field")
    public void iEnterInTheChargerNameField(String name) {
        page.getByText("Name", new Page.GetByTextOptions().setExact(true))
                .locator("xpath=following-sibling::input")
                .fill(name);
    }
//
//    @When("I enter {string} in the location field")
//    public void iEnterInTheLocationField(String location) {
//        page.getByText("Location", new Page.GetByTextOptions().setExact(true))
//                .locator("xpath=following-sibling::div/input")
//                .fill(location);
//    }

    @And("I select {string} from the charging type dropdown")
    public void iSelectFromTheChargingTypeDropdown(String type) {
        page.getByText("Type", new Page.GetByTextOptions().setExact(true))
                .locator("xpath=following-sibling::select")
                .selectOption(type);
    }

    @And("I enter {string} in the power field")
    public void iEnterInThePowerField(String power) {
        page.getByText("Power", new Page.GetByTextOptions().setExact(true))
                .locator("xpath=following-sibling::input")
                .fill(power);
    }

//    @And("I click the {string} button")
//    public void iClickTheSaveChangesButton(String buttonText) {
//        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName(buttonText)).click();
//    }

//    @Then("the new charger should appear in the chargers list")
//    public void theNewChargerShouldAppearInTheChargersList() {
//        page.waitForSelector("table tbody");
//
//        assertTrue(page.locator("table tbody tr")
//                        .locator("td:nth-child(2)")
//                        .getByText("Fast Charger Porto")
//                        .isVisible(),
//                "New charger should be visible in the stations list");    }

    @After
    public void tearDown() {
        logger.info("Cleaning up Playwright resources...");
        if (page != null) {
            page.close();
        }
        if (browser != null) {
            browser.close();
        }
        if (playwright != null) {
            playwright.close();
        }
    }
}