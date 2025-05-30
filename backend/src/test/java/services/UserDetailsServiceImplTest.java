package services;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import ua.tqs.enums.UserRole;
import ua.tqs.models.User;
import ua.tqs.repositories.UserRepository;
import ua.tqs.services.UserDetailsServiceImpl;

import java.util.NoSuchElementException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

@Slf4j
@ExtendWith(MockitoExtension.class)
class UserDetailsServiceImplTest {

    @InjectMocks
    private UserDetailsServiceImpl userDetailsService;

    @Mock
    private UserRepository userRepository;

    @Test
    void whenLoadUserByUsername_withValidEmail_thenReturnUserDetails() {
        log.info("Testing loadUserByUsername with valid email");

        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword("password123");
        user.setRole(UserRole.USER);
        log.debug("Created test user: {}", user);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        log.debug("Mocked repository response");

        UserDetails userDetails = userDetailsService.loadUserByUsername("test@example.com");
        log.debug("Loaded user details: {}", userDetails);

        assertThat(userDetails.getUsername()).isEqualTo("test@example.com");
        assertThat(userDetails.getPassword()).isEqualTo("password123");
        assertThat(userDetails.getAuthorities())
                .extracting(GrantedAuthority::getAuthority)
                .containsExactly("ROLE_USER");
    }

    @Test
    void whenLoadUserByUsername_withInvalidEmail_thenThrowException() {
        when(userRepository.findByEmail("invalid@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userDetailsService.loadUserByUsername("invalid@example.com"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessage("User not found");
    }

    @Test
    void whenUserExists_withExistingEmail_thenReturnTrue() {
        when(userRepository.findByEmail("existing@example.com"))
                .thenReturn(Optional.of(new User()));

        boolean exists = userDetailsService.userExists("existing@example.com");

        assertThat(exists).isTrue();
    }

    @Test
    void whenUserExists_withNonExistingEmail_thenReturnFalse() {
        when(userRepository.findByEmail("nonexisting@example.com"))
                .thenReturn(Optional.empty());

        boolean exists = userDetailsService.userExists("nonexisting@example.com");

        assertThat(exists).isFalse();
    }

    @Test
    void whenRegisterUser_withNewUser_thenSaveUser() {
        when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.empty());

        userDetailsService.registerUser(
                "new@example.com",
                "password123",
                "New User",
                "USER"
        );

        verify(userRepository).save(argThat(user ->
                user.getEmail().equals("new@example.com") &&
                        user.getPassword().equals("password123") &&
                        user.getName().equals("New User") &&
                        user.getRole().equals(UserRole.USER)
        ));
    }

    @Test
    void whenRegisterUser_withExistingUser_thenThrowException() {
        when(userRepository.findByEmail("existing@example.com"))
                .thenReturn(Optional.of(new User()));

        assertThatThrownBy(() -> userDetailsService.registerUser(
                "existing@example.com",
                "password123",
                "Existing User",
                "USER"
        ))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("User already exists");

        verify(userRepository, never()).save(any());
    }

    @Test
    void whenGetUserId_withValidUser_thenReturnId() {
        User user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername("test@example.com")
                .password("password")
                .roles("USER")
                .build();

        Long userId = userDetailsService.getUserId(userDetails);

        assertThat(userId).isEqualTo(1L);
    }

    @Test
    void whenGetUserId_withInvalidUser_thenThrowException() {
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername("nonexisting@example.com")
                .password("password")
                .roles("USER")
                .build();

        when(userRepository.findByEmail("nonexisting@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userDetailsService.getUserId(userDetails))
                .isInstanceOf(NoSuchElementException.class);
    }

    @Test
    void whenGetUserName_withValidUser_thenReturnName() {
        User user = new User();
        user.setName("Test User");
        user.setEmail("test@example.com");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername("test@example.com")
                .password("password")
                .roles("USER")
                .build();

        String userName = userDetailsService.getUserName(userDetails);

        assertThat(userName).isEqualTo("Test User");
    }

    @Test
    void whenGetUserName_withInvalidUser_thenReturnGuest() {
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername("nonexisting@example.com")
                .password("password")
                .roles("USER")
                .build();

        when(userRepository.findByEmail("nonexisting@example.com")).thenReturn(Optional.empty());

        String userName = userDetailsService.getUserName(userDetails);

        assertThat(userName).isEqualTo("Guest");
    }
}