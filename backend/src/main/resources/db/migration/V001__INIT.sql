CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255),
    type VARCHAR(50)
);

CREATE TABLE stations (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255),
    operator_id BIGINT,
    FOREIGN KEY (operator_id) REFERENCES app_user(id)
);
