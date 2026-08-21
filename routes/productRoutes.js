const express = require("express");
const router = express.Router();

const db = require("../db");
const verifyToken = require("../middleware/auth");

// ======================================================
// GET ALL PRODUCTS
// GET /api/products
// Customer can see all products
// ======================================================

router.get("/", (req, res) => {

    const sql = `
        SELECT
            pid,
            name,
            price,
            details,
            qty,
            owner,
            created_date
        FROM products
        ORDER BY pid DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.log(
                "GET PRODUCTS ERROR:",
                err
            );

            return res.status(500).json({
                message: "Database Error"
            });
        }

        return res.status(200).json(results);
    });
});


// ======================================================
// GET MY PRODUCTS
// GET /api/products/my-products
// Vendor can see only their own products
// ======================================================

router.get(
    "/my-products",
    verifyToken,
    (req, res) => {

        if (req.user.role !== "vendor") {

            return res.status(403).json({
                message: "Only vendors can view their products"
            });
        }

        const sql = `
            SELECT
                pid,
                name,
                price,
                details,
                qty,
                owner,
                created_date
            FROM products
            WHERE owner = ?
            ORDER BY pid DESC
        `;

        db.query(
            sql,
            [req.user.userid],
            (err, results) => {

                if (err) {

                    console.log(
                        "MY PRODUCTS ERROR:",
                        err
                    );

                    return res.status(500).json({
                        message: "Database Error"
                    });
                }

                return res.status(200).json(results);
            }
        );
    }
);


// ======================================================
// ADD PRODUCT
// POST /api/products
// Vendor only
// ======================================================

router.post(
    "/",
    verifyToken,
    (req, res) => {

        if (req.user.role !== "vendor") {

            return res.status(403).json({
                message: "Only vendors can add products"
            });
        }

        const {
            name,
            price,
            details,
            qty
        } = req.body;

        if (
            !name ||
            price === undefined ||
            price === "" ||
            !details ||
            qty === undefined ||
            qty === ""
        ) {

            return res.status(400).json({
                message: "All product fields are required"
            });
        }

        if (
            Number(price) <= 0 ||
            Number(qty) < 0
        ) {

            return res.status(400).json({
                message: "Price and quantity must be valid"
            });
        }

        const sql = `
            INSERT INTO products
            (
                name,
                price,
                details,
                qty,
                owner
            )
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                name.trim(),
                Number(price),
                details.trim(),
                Number(qty),
                req.user.userid
            ],
            (err, result) => {

                if (err) {

                    console.log(
                        "PRODUCT DATABASE ERROR:",
                        err
                    );

                    return res.status(500).json({
                        message: "Database Error"
                    });
                }

                console.log(
                    "Product inserted successfully:",
                    result.insertId
                );

                return res.status(201).json({

                    message:
                        "Product added successfully",

                    productid:
                        result.insertId
                });
            }
        );
    }
);


// ======================================================
// UPDATE PRODUCT
// PUT /api/products/:id
// Vendor can update only their own product
// ======================================================

router.put(
    "/:id",
    verifyToken,
    (req, res) => {

        if (req.user.role !== "vendor") {

            return res.status(403).json({
                message: "Only vendors can update products"
            });
        }

        const productId =
            Number(req.params.id);

        const {
            name,
            price,
            details,
            qty
        } = req.body;

        if (!productId) {

            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        if (
            !name ||
            price === undefined ||
            price === "" ||
            !details ||
            qty === undefined ||
            qty === ""
        ) {

            return res.status(400).json({
                message: "All product fields are required"
            });
        }

        if (
            Number(price) <= 0 ||
            Number(qty) < 0
        ) {

            return res.status(400).json({
                message: "Price and quantity must be valid"
            });
        }

        const sql = `
            UPDATE products
            SET
                name = ?,
                price = ?,
                details = ?,
                qty = ?
            WHERE
                pid = ?
                AND owner = ?
        `;

        db.query(
            sql,
            [
                name.trim(),
                Number(price),
                details.trim(),
                Number(qty),
                productId,
                req.user.userid
            ],
            (err, result) => {

                if (err) {

                    console.log(
                        "UPDATE PRODUCT ERROR:",
                        err
                    );

                    return res.status(500).json({
                        message: "Database Error"
                    });
                }

                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({
                        message:
                            "Product not found or you do not own this product"
                    });
                }

                return res.status(200).json({
                    message:
                        "Product updated successfully"
                });
            }
        );
    }
);


// ======================================================
// DELETE PRODUCT
// DELETE /api/products/:id
// Vendor can delete only their own product
// ======================================================

router.delete(
    "/:id",
    verifyToken,
    (req, res) => {

        if (req.user.role !== "vendor") {

            return res.status(403).json({
                message: "Only vendors can delete products"
            });
        }

        const productId =
            Number(req.params.id);

        if (!productId) {

            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const sql = `
            DELETE FROM products
            WHERE
                pid = ?
                AND owner = ?
        `;

        db.query(
            sql,
            [
                productId,
                req.user.userid
            ],
            (err, result) => {

                if (err) {

                    console.log(
                        "DELETE PRODUCT ERROR:",
                        err
                    );

                    return res.status(500).json({
                        message: "Database Error"
                    });
                }

                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({
                        message:
                            "Product not found or you do not own this product"
                    });
                }

                return res.status(200).json({
                    message:
                        "Product deleted successfully"
                });
            }
        );
    }
);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;