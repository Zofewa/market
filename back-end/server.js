const dotenv = require('dotenv');
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session'); 
const multer = require('multer');
const path = require('path');
const { error } = require('console');
const { rejects } = require('assert');
const { release } = require('os');
const { connected } = require('process');

dotenv.config();

const app = express();
const PORT = 3306;

app.use(cors({
    origin: 'http://localhost:5173', // adjust to your frontend port
    credentials: true
}));
app.use(express.json());

// Add session middleware
app.use(session({
    secret: 'Prosper', // use a strong secret in production
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // set to true if using HTTPS
}));

// Set up storage for uploaded images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Make sure this folder exists
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Create a connection pool instead of single connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    connectionLimit: 10, 
    acquireTimeout: 10000,  //10 secs
    charset: 'utf8mb4'
});

// Test the connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database');
    connection.release();
});

const saltRounds = 10;


// registering User
app.post("/signup", async (req, res) => {
    const { user_name, phone_number, password, user_type } = req.body;
    
    if (!user_name || !phone_number || !password || !user_type) {
        return res.status(400).json({ error: "All fields are required" });
    }
    
    let connection;
    try {
        // Get a connection from the pool
        connection = await new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) reject(err);
                resolve(conn);
            });
        });

        // Check if user exists
        const [user] = await new Promise((resolve, reject) => {
            connection.query(
                "SELECT * FROM user WHERE phone_number = ? LIMIT 1",
                [phone_number],
                (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                }
            );
        });
        
        if (user) {
            return res.status(409).json({ message: "User already exists" });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Insert new user
        const result = await new Promise((resolve, reject) => {
            connection.query(
                "INSERT INTO user (user_name, phone_number, password, user_type) VALUES (?, ?, ?, ?)",
                [user_name, phone_number, hashedPassword, user_type],
                (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                }
            );
        });

        // Set user_id in session after successful signup
        req.session.user_id = result.insertId;
        
        res.status(201).json({ 
            message: "User registered successfully",
            userId: result.insertId 
        });
        
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ 
            error: "Internal server error",
            message: error.message 
        });
    } finally {
        if (connection) connection.release();
    }
});



// Loggng in
app.post("/signin", async(req, res) => {
    const {phone_number, password} = req.body;
    let connection;
    try {
        connection = await new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) reject(err);
                resolve(conn);
            });
        });

        // Check if user exists
        const [user] = await new Promise((resolve, reject) => {
            connection.query(
                "SELECT * FROM user WHERE phone_number = ?",
                [phone_number],
                (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                }
            );
        });
        
        if (!user) {
            return res.status(404).json({ error: "No such account" });
        }
        
        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Set user_id in session
        req.session.user_id = user.id;
        
        res.status(200).json({ 
            message: "Logged in successfully"
        });
        
    } catch (error) {
        console.error("Error during signin:", error);
        res.status(500).json({ 
            error: "Internal server error",
            message: error.message 
        });
    } finally {
        if (connection) connection.release();
    }
});

// checking if the user is logged in
app.get("/checklogin", (req, res) => {
    if (req.session.user_id) {
        res.json({ loggedIn: true, userId: req.session.user_id });
    } else {
        res.json({ loggedIn: false });
    }
});

// Logout endpoint: destroys the session and logs the user out
app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Logout failed" });
        }
        res.clearCookie("connect.sid"); // Name may vary if you customized it
        res.json({ message: "Logged out successfully" });
    });
});

app.get("/api/score", async(req, res) => {
    const user_id = req.session.user_id;
    if(!user_id){
        return res.status(401).json({error: "Unauthorized"})
    }

    let connection;
    try {
        connection = await new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if(err) reject(err);
                resolve(conn);
            })
        })

        const  scoreBoard = await new Promise((resolve, reject) => {
            connection.query(
                `SELECT u.id, 
                    p.photo_url, 
                    u.user_name, 
                    COUNT(l.product_id) AS count,
                    ROW_NUMBER() OVER(ORDER BY points DESC) AS position,
                    CASE WHEN COUNT(l.product_id) >= 5 THEN 
                    COUNT(l.product_id)*6 
                    ELSE COUNT(l.product_id) + 2 
                    END AS points 
                    FROM user u 
                    LEFT JOIN products l ON u.id = l.user_id 
                    LEFT JOIN user_photo p on p.user_id = u.id 
                    GROUP BY u.id, u.user_name
                    ORDER BY points DESC`,
                    (err, result) => {
                        err? reject(err) : resolve(result);
                    }
            )
        }) 
        res.json(scoreBoard);
    } catch (error) {
        res.status(500).json({error: "Internal Server Error"})
    }finally{
        if(connection) connection.release();
    }
});


app.get("/percents", async(req, res) => {
    const user_id = req.session.user_id;
    if(!user_id) {
        res.status(401).json({error: "Unauthorized"});
    }

    let connection;
    try {
        connection = await new Promise((resolve, reject) => {
            pool.getConnection((err, con) => {
                if(err) reject(err);
                resolve(con)
            })
        })

        const percent = await new Promise((resolve, reject) => {
            connection.query(
                `SELECT c.name,
                    CASE
                        WHEN SUM(p.quantity) <= 0
                            THEN SUM(p.quantity) * 0
                        WHEN SUM(p.quantity) <= 5
                            THEN (SUM(p.quantity) / 100) + (0.1)
                        WHEN SUM(p.quantity) <= 10
                            THEN (SUM(p.quantity) / 100) + (0.2)
                        WHEN SUM(p.quantity) <= 20
                            THEN (SUM(p.quantity) / 100) + (0.3)
                        WHEN SUM(p.quantity) <= 40
                            THEN (SUM(p.quantity) / 100) + (0.4)
                        WHEN SUM(p.quantity) <= 70
                            THEN (SUM(p.quantity) / 100) + (0.5)
                        WHEN SUM(p.quantity) <= 100
                            THEN (SUM(p.quantity) / 100) + (0.6)
                        WHEN SUM(p.quantity) <= 200
                            THEN (SUM(p.quantity) / 100) + (0.7)
                        WHEN SUM(p.quantity) <= 300
                            THEN (SUM(p.quantity) / 100) + (0.8)
                        WHEN SUM(p.quantity) <= 400
                            THEN (SUM(p.quantity) / 100) + (0.9)
                        WHEN SUM(p.quantity) <= 500
                            THEN (SUM(p.quantity) / 100) + (1.0)
                        WHEN SUM(p.quantity) <= 1100
                            THEN (SUM(p.quantity) / 100) + (1.1)
                        WHEN SUM(p.quantity) > 1100
                            THEN (SUM(p.quantity) / 100) + (0.13)
                        END AS percent
                    FROM products p
                    LEFT JOIN categories c
                    ON c.category_id = p.category_id
                    WHERE p.user_id = ?
                    GROUP BY c.name
                    `,
                    [user_id],
                    (err, result) => {
                        if(err) reject(err);
                        resolve(result);
                    }
            )
        })
        res.json(percent);
        console.log(percent)
    } catch (error) {
        res.status(500).json({error: "Internal Server Error"})
    }finally{
        if(connection) connection.release();
    }
})


app.post("/api/chat-threads", async (req, res) => {
    const user_id = req.session.user_id;
    const { recipient_id } = req.body;
    if (!user_id) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (!recipient_id || recipient_id === user_id) {
        return res.status(400).json({ error: "Invalid recipient" });
    }
    let connection;
    try {
        connection = await new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => err ? reject(err) : resolve(conn));
        });

        // Check if a thread already exists between these users
        const [existingThread] = await new Promise((resolve, reject) => {
            connection.query(
                `SELECT * FROM chat_threads 
                 WHERE (user1_id = ? AND user2_id = ?) 
                    OR (user1_id = ? AND user2_id = ?) 
                 LIMIT 1`,
                [user_id, recipient_id, recipient_id, user_id],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });

        if (existingThread) {
            // Thread exists, return its ID
            return res.json({ thread_id: existingThread.thread_id });
        }

        // Create new thread
        const result = await new Promise((resolve, reject) => {
            connection.query(
                "INSERT INTO chat_threads (user1_id, user2_id, last_updated) VALUES (?, ?, NOW())",
                [user_id, recipient_id],
                (err, result) => err ? reject(err) : resolve(result)
            );
        });

        res.status(201).json({ thread_id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: "Internal server error", message: error.message });
    } finally {
        if (connection) connection.release();
    }
});

app.get("/api/chat-thread", async (req, res) => {
    const user_id = req.session.user_id;
    if (!user_id) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    let connection;
    try {
        connection = await new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => err ? reject(err) : resolve(conn));
        });

        const threads = await new Promise((resolve, reject) => {
            connection.query(
                `SELECT 
                    t.thread_id AS textId,
                    CASE WHEN t.user1_id = ? THEN t.user2_id ELSE t.user1_id END AS other_user_id,
                    u.user_name AS pName,
                    up.photo_url,
                    m.message_text AS lastMessage,
                    m.sent_at AS lastMessageTime,
                    m.opened AS opened
                FROM chat_threads t
                JOIN user u ON u.id = CASE WHEN t.user1_id = ? THEN t.user2_id ELSE t.user1_id END
                LEFT JOIN user_photo up ON up.user_id = u.id
                LEFT JOIN (
                    SELECT m1.thread_id, m1.message_text, m1.sent_at, m1.opened
                    FROM messages m1
                    INNER JOIN (
                        SELECT thread_id, MAX(sent_at) AS max_sent
                        FROM messages
                        GROUP BY thread_id
                    ) m2 ON m1.thread_id = m2.thread_id AND m1.sent_at = m2.max_sent
                ) m ON m.thread_id = t.thread_id
                WHERE t.user1_id = ? OR t.user2_id = ?
                ORDER BY t.last_updated DESC`,
                [user_id, user_id, user_id, user_id],
                (err, results) => err ? reject(err) : resolve(results)
            );

        });

        res.json(threads);
    } catch (error) {
        res.status(500).json({ error: "Internal server error", message: error.message });
    } finally {
        if (connection) connection.release();
    }
});

app.get("/api/recent-threads", async(req, res) => {
    const user_id = req.session.user_id;
    if (!user_id) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    let connection;
    try {
        connection = await new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => err ? reject(err) : resolve(conn));
        });

        const threads = await new Promise((resolve, reject) => {
            connection.query(
                `SELECT 
                    t.thread_id AS textId,
                    CASE WHEN t.user1_id = ? THEN t.user2_id ELSE t.user1_id END AS other_user_id,
                    u.user_name AS pName,
                    up.photo_url,
                    m.message_text AS lastMessage,
                    m.sent_at AS lastMessageTime,
                    m.opened AS opened
                FROM chat_threads t
                JOIN user u ON u.id = CASE WHEN t.user1_id = ? THEN t.user2_id ELSE t.user1_id END
                LEFT JOIN user_photo up ON up.user_id = u.id
                LEFT JOIN (
                    SELECT m1.thread_id, m1.message_text, m1.sent_at, m1.opened
                    FROM messages m1
                    INNER JOIN (
                        SELECT thread_id, MAX(sent_at) AS max_sent
                        FROM messages
                        GROUP BY thread_id
                    ) m2 ON m1.thread_id = m2.thread_id AND m1.sent_at = m2.max_sent
                ) m ON m.thread_id = t.thread_id
                WHERE t.user1_id = ? OR t.user2_id = ?
                ORDER BY t.last_updated DESC 
                LIMIT 5`,
                [user_id, user_id, user_id, user_id],
                (err, results) => err ? reject(err) : resolve(results)
            );

        });

        res.json(threads);
    } catch (error) {
        res.status(500).json({ error: "Internal server error", message: error.message });
    } finally {
        if (connection) connection.release();
    }
})

// Send a new message in a thread
app.post("/api/messages/:threadId", async (req, res) => {
    const user_id = req.session.user_id;
    const threadId = req.params.threadId;
    const { text } = req.body;
    if (!user_id) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (!text || !text.trim()) {
        return res.status(400).json({ error: "Message text required" });
    }
    let connection;
    try {
        connection = await new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => err ? reject(err) : resolve(conn));
        });

        // Insert message
        const result = await new Promise((resolve, reject) => {
            connection.query(
                "INSERT INTO messages (thread_id, sender_id, message_text, sent_at) VALUES (?, ?, ?, NOW())",
                [threadId, user_id, text],
                (err, result) => err ? reject(err) : resolve(result)
            );
        });

        await new Promise((resolve, reject) => {
            connection.query(
                "UPDATE chat_threads SET last_message = ?, last_updated = NOW() WHERE thread_id = ?",
                [text, threadId],
                (err) => err ? reject(err) : resolve()
            );
        });

        // Return the new message
        res.status(201).json({
            id: result.insertId,
            thread_id: threadId,
            sender_id: user_id,
            text,
            created_at: new Date(),
            sender: "user"
        });

    } catch (error) {
        res.status(500).json({ error: "Internal server error", message: error.message });
    } finally {
        if (connection) connection.release();
    }
});


// Get messages for a thread
app.get("/api/messages/:threadId", async (req, res) => {
    const user_id = req.session.user_id;
    const threadId = req.params.threadId;
    if (!user_id) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    let connection;
    try {
        connection = await new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => err ? reject(err) : resolve(conn));
        });

        // Check if user is a participant in the thread
        const [thread] = await new Promise((resolve, reject) => {
            connection.query(
                "SELECT * FROM chat_threads WHERE thread_id = ? AND (user1_id = ? OR user2_id = ?)",
                [threadId, user_id, user_id],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
        if (!thread) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const messages = await new Promise((resolve, reject) => {
            connection.query(
                `SELECT 
                    message_id AS id,
                    sender_id,
                    message_text AS text,
                    sent_at,
                    CASE WHEN sender_id = ? THEN 'user' ELSE 'bot' END AS sender
                FROM messages
                WHERE thread_id = ?
                ORDER BY sent_at ASC`,
                [user_id, threadId],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
        // Mark messages as opened for the other participant
        await new Promise((resolve, reject) => {
            connection.query(
                `Update messages
                SET opened = "yes"
                WHERE thread_id = ? AND sender_id != ?`,
                [threadId, user_id],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    } finally {
        if (connection) connection.release();
    }

});


// inserting the product
app.post("/newlisting", async (req, res) => {
    // Get user_id from session (set at login)
    const user_id = req.session.user_id;
    if (!user_id) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    const {
        category_id,
        location, // { city, district, country, latitude, longitude }
        name,
        price,
        quantity,
        unit,
        description,
        status,
        image_url
    } = req.body;

    let connection;
    try {
        connection = await new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) reject(err);
                resolve(conn);
            });
        });

        // 1. Insert location (or get existing)
        let location_id;
        const [existingLocation] = await new Promise((resolve, reject) => {
            connection.query(
                "SELECT location_id FROM locations WHERE city = ? AND country = ? AND latitude = ? AND longitude = ? LIMIT 1",
                [location.city, location.country, location.latitude, location.longitude],
                (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                }
            );
        });

        if (existingLocation) {
            location_id = existingLocation.location_id;
        } else {
            const locationResult = await new Promise((resolve, reject) => {
                connection.query(
                    "INSERT INTO locations (city, district, country, latitude, longitude) VALUES (?, ?, ?, ?, ?)",
                    [location.city, location.district, location.country, location.latitude, location.longitude],
                    (err, result) => {
                        if (err) reject(err);
                        resolve(result);
                    }
                );
            });
            location_id = locationResult.insertId;
        }

        // 2. Insert product
        const productResult = await new Promise((resolve, reject) => {
            connection.query(
                "INSERT INTO products (user_id, category_id, location_id, name, price, quantity, unit, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [user_id, category_id, location_id, name, price, quantity, unit, description, status],
                (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                }
            );
        });
        const product_id = productResult.insertId;
 
       
        if (image_url) {
            const imageResult = await new Promise((resolve, reject) => {
                connection.query(
                    "INSERT INTO product_images (product_id, image_url) VALUES (?, ?)",
                    [product_id, image_url],
                    (err, result) => {
                        if (err) reject(err);
                        resolve(result);
                    }
                );
            });

            
        }

        res.status(201).json({
            message: "Product created successfully",
            product_id,
            location_id
        });

    } catch (error) {
        console.error("Error inserting product:", error);
        res.status(500).json({ error: "Internal server error", message: error.message });
    } finally {
        if (connection) connection.release();
    }
});

// Image product upload
app.post('/api/upload-image', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ image_url: imageUrl });
});

// New code block for fetching category by name
app.get('/api/categories', async (req, res) => {
    const { name } = req.query;
    if (!name) {
        return res.status(400).json({ error: "Category name is required" });
    }
    let connection;
    try {
        connection = await new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) reject(err);
                resolve(conn);
            });
        });

        const [category] = await new Promise((resolve, reject) => {
            connection.query(
                "SELECT category_id FROM categories WHERE name = ? LIMIT 1",
                [name],
                (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                }
            );
        });

        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }

        res.json({ category_id: category.category_id });
    } catch (error) {
        console.error("Error fetching category:", error);
        res.status(500).json({ error: "Internal server error", message: error.message });
    } finally {
        if (connection) connection.release();
    }
});

// Get listings for the currently logged-in user, including category and image info
app.get("/mylistings", async (req, res) => {
    const user_id = req.session.user_id;
    if (!user_id) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    let connection;
    try {
        connection = await new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) reject(err);
                resolve(conn);
            });
        });
        const listings = await new Promise((resolve, reject) => {
            connection.query(
                `SELECT 
                    p.product_id, p.name, p.price, p.quantity, p.unit, p.description, p.status,
                    c.name AS category,
                    pi.image_url
                 FROM products p
                 LEFT JOIN categories c ON p.category_id = c.category_id
                 LEFT JOIN product_images pi ON p.product_id = pi.product_id
                 WHERE p.user_id = ?`,
                [user_id],
                (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                }
            );
        });
        res.json(listings);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    } finally {
        if (connection) connection.release();
    }
});

// Edit a product (update)
app.put("/mylistings/:id", async (req, res) => {
    const user_id = req.session.user_id;
    const product_id = req.params.id;
    const { name, price, quantity, unit, description, status, category_id } = req.body;
    if (!user_id) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    let connection;
    try {
        connection = await new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) reject(err);
                resolve(conn);
            });
        });
        await new Promise((resolve, reject) => {
            connection.query(
                "UPDATE products SET name=?, price=?, quantity=?, unit=?, description=?, status=?, category_id=? WHERE product_id=? AND user_id=?",
                [name, price, quantity, unit, description, status, category_id, product_id, user_id],
                (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                }
            );
        });
        res.json({ message: "Product updated successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    } finally {
        if (connection) connection.release();
    }
});


//get items
app.get("/api/items", async(req, res) => {
    const user_id = req.session.user_id;
    if(!user_id){
        res.status(401).json({error: "Unauthorized"})
    }

    let connection;
    try {
        connection = await new Promise((resolve, reject) =>{
            pool.getConnection((err, con) => {
                if(err) reject(err);
                resolve(con);
            })
        })

        const items = await new Promise((resolve, reject) => {
            connection.query(
                `SELECT c.name AS category,
                p.product_id,
                p.price,
                p.date_added FROM products p
                LEFT JOIN categories c on c.category_id = p.category_id
                WHERE user_id = ? 
                ORDER By date_added LIMIT 4`,
                [user_id],
                (err, result) => {
                    if(err) reject(err);
                    resolve(result)
                }
            );
        });
        res.json(items);
    } catch (error) {
        res.status(500).json({error: "Server error"})
    }finally{
        if(connection) connection.release();
    }
})

//get total listings
app.get("/api/total-listings",  async(req, res)=>{
    const user_id = req.session.user_id;
    if(!user_id){
        return res.status(401).json({error:"Unauthorized"})
    }

    let connection;
    try {
        connection = await new Promise((resolve,reject) =>{
            pool.getConnection((err,conn)=>{
                if(err) reject(err);
                resolve(conn);
            })
        });

        const [total] = await new Promise((resolve, reject) => {
            connection.query(
                "SELECT COUNT(product_id) AS total, SUM(price) AS sum FROM `products` WHERE user_id = ?",
                [user_id],
                (err, result) => {
                    if(err) reject(err);
                    resolve(result);
                }
            )

        })

        if(!total) res.status(404).json({message: "failed"});
        res.json(total);

    } catch (error) {
        res.json({error: "Server error"});
    }finally{
        if(connection) connection.release();
    }
})

// update user profile details
app.post("/api/update-profile-photo", async (req, res) => {
    const user_id = req.session.user_id;
    const photo_url = req.body.image_url;

    if(!user_id){
        return res.status(401).json({error:"Unauthorized"});
    }

    let connection;
    try {
        connection = await new Promise((resolve,reject) =>{
            pool.getConnection((err,conn) =>{
                if(err)reject(err);
                resolve(conn)
            })
        })

        const [pic] = await new Promise((resolve, reject) =>{
            connection.query(
                "SELECT * FROM user_photo WHERE user_id = ?",
                [user_id],
                (err, res)=>{
                    if(err) reject(err);
                    resolve(res)
                }
            )
        })

        if(pic){
             await new Promise((resolve, reject) =>{
                connection.query(
                    "UPDATE user_photo SET photo_url = ? WHERE user_id = ?",
                    [photo_url, user_id],
                    (err, res)=>{
                        if(err) reject(err);
                        resolve(res);
                    }
                )
            })
            res.json({message: "updated successfully"})
        }else{
             await new Promise((resolve, reject) =>{
                connection.query(
                    "INSERT INTO user_photo(user_id, photo_url) VALUES(?,?)",
                    [user_id, photo_url],
                    (err, res)=>{
                        if(err) reject(err);
                        resolve(res);
                    }
                )
            })
            res.json({message: "updated successfully"})
        }

       
    } catch (error) {
        res.status(500).json({error: "internal server error"});
    }finally{
        if(connection) connection.release();
    }
    
})

app.get("/api/categorylist", async (req, res) => {
    let connection;
    try {
        connection = await new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) reject(err);
                resolve(conn);
            });
        });
        const categories = await new Promise((resolve, reject) => {
            connection.query(
                "SELECT category_id, name FROM categories",
                [],
                (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                }
            );
        });
        res.json(categories)
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    } finally {
        if (connection) connection.release();
    }
});

// Delete a product
app.delete("/mylistings/:id", async (req, res) => {
    const user_id = req.session.user_id;
    const product_id = req.params.id;
    if (!user_id) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    let connection;
    try {
        connection = await new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) reject(err);
                resolve(conn);
            });
        });
        await new Promise((resolve, reject) => {
            connection.query(
                "DELETE FROM products WHERE product_id=? AND user_id=?",
                [product_id, user_id],
                (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                }
            );
        });
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    } finally {
        if (connection) connection.release();
    }
});

app.get("/api/products", async (req, res) => {
    let connection;
    const user_id = req.session.user_id;
    if(!user_id){
        try {
        connection = await new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) reject(err);
                resolve(conn);
            });
        });

        const products = await new Promise((resolve, reject) => {
            connection.query(
                `SELECT p.product_id AS id,
                 p.name AS product_name,
                 p.price, p.quantity,
                  p.unit, p.description,
                   p.status, l.location_id,
                    l.city, 
                    l.district,
                    u.id AS seller_id,
                     c.name AS category
                     , pi.image_url,
                      u.user_name AS seller FROM products p 
                    LEFT JOIN categories c ON p.category_id = c.category_id 
                    LEFT JOIN product_images pi ON p.product_id = pi.product_id 
                    LEFT JOIN user u ON p.user_id = u.id 
                    LEFT JOIN locations l ON p.location_id = l.location_id 
                    WHERE p.status = 'active' ORDER BY p.product_id DESC`,
                [],
                (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                }
            );
        });

            res.json(products);
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        } finally {
            if (connection) connection.release();
        }
    }

    try {
    connection = await new Promise((resolve, reject) => {
        pool.getConnection((err, conn) => {
            if (err) reject(err);
            resolve(conn);
        });
    });

    const products = await new Promise((resolve, reject) => {
        connection.query(
            `SELECT p.product_id AS id,
                p.name AS product_name,
                p.price, p.quantity,
                p.unit, p.description,
                p.status, l.location_id,
                l.city, 
                l.district,
                u.id AS seller_id,
                    c.name AS category
                    , pi.image_url,
                    u.user_name AS seller FROM products p 
                LEFT JOIN categories c ON p.category_id = c.category_id 
                LEFT JOIN product_images pi ON p.product_id = pi.product_id 
                LEFT JOIN user u ON p.user_id = u.id 
                LEFT JOIN locations l ON p.location_id = l.location_id 
                WHERE p.status = 'active' ORDER BY p.product_id DESC`,
            [],
            (err, results) => {
                if (err) reject(err);
                resolve(results);
            }
        );
    });

    res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    } finally {
        if (connection) connection.release();
    }

});

// Example: /api/sellers returns sellers with their location, items, and quantity
app.get("/api/sellers", async (req, res) => {
    let connection;
    try {
        connection = await new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => err ? reject(err) : resolve(conn));
        });
        // Adjust query to match your schema
        const sellers = await new Promise((resolve, reject) => {
            connection.query(
                `SELECT 
                    u.id, u.user_name AS name, u.phone_number AS contact,
                    l.latitude, l.longitude, l.city, l.district,
                    GROUP_CONCAT(DISTINCT c.name) AS items,
                    SUM(p.quantity) AS total_quantity
                FROM user u
                JOIN products p ON u.id = p.user_id
                JOIN categories c ON p.category_id = c.category_id
                JOIN locations l ON p.location_id = l.location_id
                WHERE p.status = 'active'
                GROUP BY u.id
                `,
                [],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
        // Map volume based on total_quantity
        const mapped = sellers.map(s => ({
            ...s,
            items: s.items ? s.items.split(",") : [],
            volume:
                s.total_quantity > 1000 ? "High" :
                s.total_quantity > 300 ? "Medium" : "Low",
            location: [s.latitude, s.longitude]
        }));
        res.json(mapped);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    } finally {
        if (connection) connection.release();
    }
});

//get current user
app.get("/user", async (req, res) => {
    const user_id = req.session.user_id;
    if (!user_id) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    let connection;
    try {
        connection = await new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) reject(err);
                resolve(conn);
            });
        });
        const [user] = await new Promise((resolve, reject) => {
            connection.query(
                `SELECT 
                    u.id, u.user_type, 
                    u.account_state, 
                    u.registered_date,
                    u.user_name,
                    u.phone_number,
                    up.photo_url
                    FROM user u
                    LEFT JOIN user_photo up ON u.id = up.user_id
                    WHERE u.id =?`,
                [user_id],
                (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                }
            );
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log(error)
    } finally {
        if (connection) connection.release();
    }
});

// Serve uploaded images statically
app.use('/uploads', express.static('uploads'));

// Handle graceful shutdown
process.on('SIGINT', () => {
    pool.end(() => {
        console.log('Database pool closed');
        process.exit(0);
    });
});

app.listen(PORT, () => {
    console.log("Server running on port 5001");
});