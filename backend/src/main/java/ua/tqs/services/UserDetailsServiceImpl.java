package ua.tqs.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ua.tqs.enums.UserRole;
import ua.tqs.models.User;
import ua.tqs.repositories.UserRepository;

import java.util.List;
import java.util.Optional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }

    public boolean userExists(String username) {
        return userRepository.findByEmail(username).isPresent();
    }

    public void registerUser(String username, String password, String name, String role) {
        if (userExists(username)) {
            throw new IllegalArgumentException("User already exists");
        }

        User user = new User();
        user.setEmail(username);
        user.setPassword(password);
        user.setName(name);
        user.setRole(UserRole.valueOf(role.toUpperCase()));

        userRepository.save(user);
    }

    public Long getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow()
                .getId();
    }
}
