CREATE SEQUENCE IF NOT EXISTS users_id_seq;

CREATE TABLE IF NOT EXISTS slots (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    reserved BOOLEAN DEFAULT FALSE,
    charging_type VARCHAR(50),
    power VARCHAR(50),
    price_per_kwh DOUBLE PRECISION,
    discount BOOLEAN DEFAULT FALSE,
    discount_value DOUBLE PRECISION,
    discount_start_time TIME,
    discount_end_time TIME
);

CREATE TABLE IF NOT EXISTS users (
            id BIGINT PRIMARY KEY DEFAULT nextval('users_id_seq'),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password VARCHAR(255),
    role VARCHAR(50)
);

ALTER SEQUENCE users_id_seq OWNED BY users.id;

CREATE TABLE IF NOT EXISTS reservations (
    id BIGINT PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    slot_id VARCHAR(255) REFERENCES slots(id),
    status VARCHAR(50),
    creation_date TIMESTAMP,
    start_time TIMESTAMP,
    duration_minutes INTEGER,
    consumption_kwh DOUBLE PRECISION,
    total_cost DOUBLE PRECISION,
    paid BOOLEAN DEFAULT FALSE
);