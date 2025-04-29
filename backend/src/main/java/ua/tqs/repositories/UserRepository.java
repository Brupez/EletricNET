package ua.tqs.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import ua.tqs.models.User;

public interface UserRepository extends JpaRepository<User, Long> {
}
