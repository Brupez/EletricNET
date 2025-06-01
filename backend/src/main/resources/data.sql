INSERT INTO users (id, email, password, name, role) VALUES
    (1, 'joana@gmail.com', 'password', 'Joana', 'ADMIN'),
    (2, 'tiago@gmail.com', 'password', 'Tiago', 'USER')
    ON CONFLICT (id) DO NOTHING;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users) + 1);