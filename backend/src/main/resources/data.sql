INSERT INTO users (id, username, password, name, role) VALUES (1, 'joana', 'password', 'Joana', 'ADMIN');
INSERT INTO users (id, username, password, name, role) VALUES (2, 'tiago', 'password', 'Tiago', 'USER');

INSERT INTO stations (
    id, name, latitude, longitude, status,
    discount, discount_value, discount_start_time, discount_end_time, operator_id
) VALUES (
             1, 'Estação UA', 40.633, -8.659, 'AVAILABLE',
             true, 0.10, '08:00:00', '18:00:00', 2
         );
