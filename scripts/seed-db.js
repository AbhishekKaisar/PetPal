const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
    console.error("Error: POSTGRES_URL environment variable is missing.");
    console.error("Please create a .env file with POSTGRES_URL=<your_connection_string>");
    process.exit(1);
}

const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

async function seed() {
    try {
        console.log("Connecting to database...");
        const client = await pool.connect();

        try {
            console.log("Checking for existing users...");
            // 1. Create a User
            const userCheck = await client.query('SELECT * FROM users WHERE email = $1', ['test@example.com']);
            let userId;

            if (userCheck.rows.length === 0) {
                console.log("Creating test user...");
                const userRes = await client.query(
                    `INSERT INTO users (google_id, email, full_name, username, password, phone, address, role, profile_picture)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
                    ['google_123', 'test@example.com', 'Test User', 'testuser', 'password123', '1234567890', '123 Pet St', 'user', 'https://placehold.co/100']
                );
                userId = userRes.rows[0].id;
                console.log("User created with ID:", userId);
            } else {
                userId = userCheck.rows[0].id;
                console.log("Test user already exists (ID: " + userId + ")");
            }

            // 2. Create Rehome/Pet entries
            console.log("Seeding pets...");

            const pets = [
                {
                    type: 'Dog',
                    name: 'Buddy',
                    gender: 'Male',
                    age: 2,
                    breed: 'Golden Retriever',
                    vaccinated: 'Yes',
                    potty_trained: 'Yes',
                    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
                    reason: 'Moving houses'
                },
                {
                    type: 'Cat',
                    name: 'Luna',
                    gender: 'Female',
                    age: 1,
                    breed: 'Siamese',
                    vaccinated: 'Yes',
                    potty_trained: 'Yes',
                    image: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=600&q=80',
                    reason: 'Allergies'
                }
            ];

            for (const pet of pets) {
                // Check if pet exists (by name for simplicity)
                const petCheck = await client.query('SELECT * FROM rehome WHERE name = $1', [pet.name]);
                if (petCheck.rows.length === 0) {
                    await client.query('BEGIN');

                    const rehomeRes = await client.query(
                        `INSERT INTO rehome (user_id, type, name, gender, age, breed, vaccinated, potty_trained, image, reason_behind_rehome) 
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING rehome_id`,
                        [userId, pet.type, pet.name, pet.gender, pet.age, pet.breed, pet.vaccinated, pet.potty_trained, pet.image, pet.reason]
                    );
                    const rehomeId = rehomeRes.rows[0].rehome_id;

                    // Insert into animal table too as per schema logic (though redundant)
                    await client.query(
                        `INSERT INTO animal (rehome_id, type, name, gender, age, breed, vaccinated, potty_trained, image) 
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                        [rehomeId, pet.type, pet.name, pet.gender, pet.age, pet.breed, pet.vaccinated, pet.potty_trained, pet.image]
                    );

                    await client.query('COMMIT');
                    console.log(`Added pet: ${pet.name}`);
                } else {
                    console.log(`Pet ${pet.name} already exists.`);
                }
            }

            console.log("Seeding complete!");

        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

    } catch (err) {
        console.error("Error seeding database:", err);
    } finally {
        await pool.end();
    }
}

seed();
