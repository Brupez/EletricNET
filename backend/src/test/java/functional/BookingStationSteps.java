package functional;

import io.cucumber.java.en.*;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;


public class BookingStationSteps {

    private WebDriver driver;

    @Given("I am authenticated as a registered user at {string}")
    public void iAmAuthenticatedAsARegisteredUserAt(String url) {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless");

        driver = new ChromeDriver(options);
        driver.get(url);
    }
}

