-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    phone VARCHAR(20),
    address VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'user', -- simplified enum to varchar for postgres simplicity in setup, or create type
    profile_picture VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Rehome listings
CREATE TABLE IF NOT EXISTS rehome (
    rehome_id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL,
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    age INT NOT NULL,
    breed VARCHAR(50) NOT NULL,
    vaccinated VARCHAR(5) NOT NULL,
    potty_trained VARCHAR(5) NOT NULL,
    image TEXT NOT NULL, -- Storing as base64 or URL is better for Vercel functions due to payload limits, changing BLOB to TEXT
    reason_behind_rehome VARCHAR(200) NOT NULL
);

-- Animal Table
CREATE TABLE IF NOT EXISTS animal (
    animal_id SERIAL PRIMARY KEY,
    rehome_id INT REFERENCES rehome(rehome_id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL,
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    age INT NOT NULL,
    breed VARCHAR(50) NOT NULL,
    vaccinated VARCHAR(5) NOT NULL,
    potty_trained VARCHAR(5) NOT NULL,
    image TEXT NOT NULL -- Changed to TEXT
);

-- Adoption Applications
CREATE TABLE IF NOT EXISTS adoption (
    adoption_id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    animal_id INT NOT NULL REFERENCES animal(animal_id) ON DELETE CASCADE,
    num_of_children INT NOT NULL,
    phone_num VARCHAR(20) NOT NULL,
    num_of_adults INT NOT NULL,
    home_image TEXT NOT NULL, -- Changed to TEXT
    animal_proof VARCHAR(5) NOT NULL,
    other_pets VARCHAR(5) NOT NULL,
    other_pets_spayed VARCHAR(5) NOT NULL,
    allergies_to_pets VARCHAR(5) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending'
);