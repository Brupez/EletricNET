package config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import ua.tqs.config.SecurityConfig;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;


class SecurityConfigTest {

    private SecurityConfig securityConfig;
    private AuthenticationConfiguration authConfig;

    @BeforeEach
    void setUp() {
        securityConfig = new SecurityConfig();
        authConfig = mock(AuthenticationConfiguration.class);
    }

    @Test
    void corsConfigurationSource_shouldReturnValidConfiguration() {
        CorsConfigurationSource configSource = securityConfig.corsConfigurationSource();
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/auth/login");

        CorsConfiguration corsConfiguration = configSource.getCorsConfiguration(request);

        assertThat(corsConfiguration).isNotNull();
        assertThat(corsConfiguration.getAllowedOriginPatterns())
            .containsExactlyInAnyOrder("http://localhost:*", "http://deti-tqs-05.ua.pt:*");
        assertThat(corsConfiguration.getAllowedMethods())
            .containsExactlyInAnyOrder("GET", "POST", "PUT", "DELETE", "OPTIONS");
        assertThat(corsConfiguration.getAllowedHeaders())
            .contains("Authorization", "Content-Type", "X-Requested-With");
        assertThat(corsConfiguration.getExposedHeaders())
            .contains("Authorization");
        assertThat(corsConfiguration.getAllowCredentials()).isTrue();
        assertThat(corsConfiguration.getMaxAge()).isEqualTo(3600L);
    }

    @Test
    void passwordEncoder_shouldReturnNoOpPasswordEncoder() {
        PasswordEncoder encoder = securityConfig.passwordEncoder();

        assertThat(encoder.encode("password")).isEqualTo("password");
        assertThat(encoder.matches("password", "password")).isTrue();
    }

    @Test
    void authenticationManager_shouldReturnConfiguredManager() throws Exception {
        AuthenticationManager mockAuthManager = mock(AuthenticationManager.class);
        when(authConfig.getAuthenticationManager()).thenReturn(mockAuthManager);

        AuthenticationManager resultManager = securityConfig.authenticationManager(authConfig);

        assertThat(resultManager).isEqualTo(mockAuthManager);
    }


    @Test
    void corsConfiguration_shouldHaveCorrectExposedHeaders() {
        CorsConfigurationSource configSource = securityConfig.corsConfigurationSource();
        CorsConfiguration corsConfiguration = configSource.getCorsConfiguration(new MockHttpServletRequest());

        assertThat(corsConfiguration.getExposedHeaders())
            .containsExactly("Authorization");
    }

    @Test
    void corsConfiguration_shouldHaveCorrectAllowedHeaders() {
        CorsConfigurationSource configSource = securityConfig.corsConfigurationSource();
        CorsConfiguration corsConfiguration = configSource.getCorsConfiguration(new MockHttpServletRequest());

        assertThat(corsConfiguration.getAllowedHeaders())
            .contains(
                "Authorization",
                "Content-Type",
                "X-Requested-With"
            );
    }
}
