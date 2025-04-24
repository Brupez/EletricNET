package ua.tqs.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import ua.tqs.enums.UserType;

@Entity
@Getter
@Setter
@Data
public class User {
    @Id
    @GeneratedValue
    private Long id;

    private String nome;

    @Enumerated(EnumType.STRING)
    private UserType tipo;
}