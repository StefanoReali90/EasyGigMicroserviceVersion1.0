CREATE DATABASE "easygig-profiles";
CREATE DATABASE "easygig-bookings";
CREATE DATABASE "easygig-notifications";

\c "easygig-profiles"

CREATE TABLE nation (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE region (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    nation_id BIGINT REFERENCES nation(id)
);

CREATE TABLE city (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region_id BIGINT REFERENCES region(id),
    CONSTRAINT unique_city_region UNIQUE (name, region_id)
);