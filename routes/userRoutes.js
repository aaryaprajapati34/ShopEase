const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/auth");

router.post("/signup", async (req, res) => {

    const { username, password, emailid, phone, role } = req.body;

    if (!username || !password || !emailid || !phone || !role) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users (username, password, emailid, phone, role)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [username, hashedPassword, emailid, phone, role],
            (err, result) => {

                if (err) {
                    console.log("SIGNUP DATABASE ERROR:", err);

                    return res.status(500).json({
                        message: "Database Error"
                    });
                }

                console.log("User inserted successfully:", result.insertId);

                res.status(201).json({
                    message: "User registered successfully"
                });
            }
        );

    } catch (error) {

        console.log("HASH ERROR:", error);

        res.status(500).json({
            message: "Error hashing password"
        });
    }
});

router.post("/login", (req, res) => {

    const { emailid, password } = req.body;

    if (!emailid || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    const sql = "SELECT * FROM users WHERE emailid = ?";

    db.query(sql, [emailid], async (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                message: "Database Error"
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const user = result[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        const token = jwt.sign(
            {
                userid: user.userid,
                role: user.role
            },
            "mySecretKey",
            {
                expiresIn: "7d"
            }
        );

        res.status(200).json({
    message: "Login successful",
    token: token,
    role: user.role
});
        });
    });

router.get("/profile", verifyToken, (req, res) => {

    res.json({
        message: "Welcome",
        user: req.user
    });

});

module.exports = router;