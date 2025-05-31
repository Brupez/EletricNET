package login;

import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import ua.tqs.login.JwtUtil;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private static final String SECRET = "dGhpc2lzYXZlcnlsb25nc2VjcmV0a2V5Zm9ydGVzdGluZ3B1cnBvc2Vz";

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(SECRET);
    }

    @Test
    void whenGenerateToken_thenValidTokenIsCreated() {
        String token = jwtUtil.generateToken("test@example.com", "USER");

        assertThat(token).isNotEmpty();
        assertThat(jwtUtil.validateToken(token)).isTrue();
        assertThat(jwtUtil.getUsername(token)).isEqualTo("test@example.com");
    }

    @Test
    void whenValidateToken_withValidToken_thenReturnTrue() {
        String token = jwtUtil.generateToken("test@example.com", "USER");

        boolean isValid = jwtUtil.validateToken(token);

        assertThat(isValid).isTrue();
    }

    @Test
    void whenValidateToken_withInvalidToken_thenReturnFalse() {
        String invalidToken = "invalidtoken.123.456";

        boolean isValid = jwtUtil.validateToken(invalidToken);

        assertThat(isValid).isFalse();
    }

    @Test
    void whenGetUsername_withValidToken_thenReturnUsername() {
        String token = jwtUtil.generateToken("test@example.com", "USER");

        String username = jwtUtil.getUsername(token);

        assertThat(username).isEqualTo("test@example.com");
    }

    @Test
    void whenGetUsername_withInvalidToken_thenThrowJwtException() {
        String invalidToken = "invalidtoken.123.456";

        boolean throwsException = false;
        try {
            jwtUtil.getUsername(invalidToken);
        } catch (JwtException e) {
            throwsException = true;
        }

        assertThat(throwsException).isTrue();
    }
}
