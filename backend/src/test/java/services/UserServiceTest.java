package services;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ua.tqs.enums.UserRole;
import ua.tqs.models.User;
import ua.tqs.repositories.UserRepository;
import ua.tqs.services.UserService;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@Slf4j
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @InjectMocks
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Test
    void whenGetAllUsers_thenReturnListOfUsers() {
        log.info("Testing get all users");

        // Given
        User user1 = new User();
        user1.setId(1L);
        user1.setEmail("user1@test.com");
        user1.setName("User One");
        user1.setRole(UserRole.valueOf("USER"));
        log.debug("Created user1: {}", user1);

        User user2 = new User();
        user2.setId(2L);
        user2.setEmail("user2@test.com");
        user2.setName("User Two");
        user2.setRole(UserRole.valueOf("ADMIN"));
        log.debug("Created user2: {}", user2);

        List<User> expectedUsers = Arrays.asList(user1, user2);
        when(userRepository.findAll()).thenReturn(expectedUsers);
        log.debug("Mocked repository to return {} users", expectedUsers.size());

        // When
        log.debug("Executing getAllUsers");
        List<User> actualUsers = userService.getAllUsers();

        // Then
        assertThat(actualUsers)
            .hasSize(2)
            .usingRecursiveComparison()
            .isEqualTo(expectedUsers);

        verify(userRepository).findAll();
        log.info("Successfully verified getAllUsers returns correct list of users");
    }

    @Test
    void whenGetAllUsers_andNoUsers_thenReturnEmptyList() {
        log.info("Testing getAllUsers with empty list");

        // Given
        when(userRepository.findAll()).thenReturn(Collections.emptyList());
        log.debug("Mocked repository to return empty list");

        // When
        List<User> actualUsers = userService.getAllUsers();

        // Then
        assertThat(actualUsers).isEmpty();
        verify(userRepository).findAll();
        log.info("Successfully verified getAllUsers returns empty list");
    }
}