CREATE TABLE users (id serial PRIMARY KEY, name VARCHAR(100), email VARCHAR(100) UNIQUE, entrie BIGINT DEFAULT 0, joined TIMESTAMP);
CREATE TABLE logins (id serial PRIMARY KEY, hash VARCHAR(100) UNIQUE, email VARCHAR(100) UNIQUE);