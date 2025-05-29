package dto;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import ua.tqs.dto.AuthRequest;

import static org.assertj.core.api.Assertions.assertThat;


@Slf4j
class AuthDTOTest {

    @Test
    void testAuthRequest() {
        log.info("testAuthRequest");
        AuthRequest authRequest = new AuthRequest();
        authRequest.setUsername("testUser@gmail.com");
        authRequest.setPassword("testPass");
        authRequest.setName("Test User");
        authRequest.setRole("USER");

        log.info("authRequest: {}", authRequest);
        assertThat(authRequest.getUsername()).isEqualTo("testUser@gmail.com");
        assertThat(authRequest.getPassword()).isEqualTo("testPass");
        assertThat(authRequest.getName()).isEqualTo("Test User");
        assertThat(authRequest.getRole()).isEqualTo("USER");
    }
}
