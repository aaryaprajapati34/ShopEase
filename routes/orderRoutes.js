const express = require("express");
const router = express.Router();

const db = require("../db");
const verifyToken = require("../middleware/auth");

// ======================================================
// PLACE ORDER
// POST /api/orders
// ======================================================

router.post("/", verifyToken, (req, res) => {

    // --------------------------------------------------
    // CUSTOMER ONLY
    // --------------------------------------------------

    if (req.user.role !== "customer") {
        return res.status(403).json({
            message: "Only customers can place orders"
        });
    }

    // --------------------------------------------------
    // GET REQUEST DATA
    // --------------------------------------------------

    const {
        productid,
        quantity,
        customer_name,
        phone,
        address,
        payment_method
    } = req.body;

    const requestedQuantity = Number(quantity);

    // --------------------------------------------------
    // VALIDATE PRODUCT
    // --------------------------------------------------

    if (!productid || !requestedQuantity || requestedQuantity <= 0) {
        return res.status(400).json({
            message: "Product ID and valid quantity are required"
        });
    }

    // --------------------------------------------------
    // VALIDATE CUSTOMER DETAILS
    // --------------------------------------------------

    if (
        !customer_name ||
        !phone ||
        !address ||
        !payment_method
    ) {
        return res.status(400).json({
            message:
                "Customer name, phone, address and payment method are required"
        });
    }

    // ==================================================
    // GET PRODUCT
    //
    // products table:
    // pid
    // name
    // price
    // qty
    // ==================================================

    const productSql = `
        SELECT
            pid AS productid,
            name AS productname,
            price,
            qty AS stock
        FROM products
        WHERE pid = ?
    `;

    db.query(
        productSql,
        [productid],
        (err, products) => {

            // --------------------------------------------------
            // PRODUCT DATABASE ERROR
            // --------------------------------------------------

            if (err) {
                console.log(
                    "PRODUCT DATABASE ERROR:",
                    err
                );

                return res.status(500).json({
                    message: "Database Error"
                });
            }

            // --------------------------------------------------
            // PRODUCT NOT FOUND
            // --------------------------------------------------

            if (!products || products.length === 0) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            const product = products[0];

            const currentStock = Number(product.stock);
            const productPrice = Number(product.price);

            // --------------------------------------------------
            // CHECK STOCK
            // --------------------------------------------------

            if (currentStock <= 0) {
                return res.status(400).json({
                    message:
                        "This product is currently out of stock."
                });
            }

            if (requestedQuantity > currentStock) {
                return res.status(400).json({
                    message:
                        `Only ${currentStock} item(s) available in stock.`
                });
            }

            // --------------------------------------------------
            // CALCULATE TOTAL
            // --------------------------------------------------

            const total =
                productPrice * requestedQuantity;

            // ==================================================
            // REDUCE STOCK
            // ==================================================

            const updateStockSql = `
                UPDATE products
                SET qty = qty - ?
                WHERE pid = ?
                AND qty >= ?
            `;

            db.query(
                updateStockSql,
                [
                    requestedQuantity,
                    productid,
                    requestedQuantity
                ],
                (err, stockResult) => {

                    // --------------------------------------------------
                    // STOCK UPDATE ERROR
                    // --------------------------------------------------

                    if (err) {
                        console.log(
                            "STOCK UPDATE ERROR:",
                            err
                        );

                        return res.status(500).json({
                            message:
                                "Could not update product stock"
                        });
                    }

                    // --------------------------------------------------
                    // STOCK WAS NOT AVAILABLE
                    // --------------------------------------------------

                    if (stockResult.affectedRows === 0) {
                        return res.status(400).json({
                            message:
                                "Not enough stock available."
                        });
                    }

                    // ==================================================
                    // INSERT ORDER
                    // ==================================================

                    const orderSql = `
                        INSERT INTO orders
                        (
                            userid,
                            productid,
                            quantity,
                            total_amount,
                            customer_name,
                            phone,
                            address,
                            payment_method,
                            status
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;

                    db.query(
                        orderSql,
                        [
                            req.user.userid,
                            productid,
                            requestedQuantity,
                            total,
                            customer_name,
                            phone,
                            address,
                            payment_method,
                            "Placed"
                        ],
                        (err, result) => {

                            // --------------------------------------------------
                            // ORDER INSERT ERROR
                            // --------------------------------------------------

                            if (err) {

                                console.log(
                                    "ORDER DATABASE ERROR:",
                                    err
                                );

                                // ------------------------------------------
                                // RESTORE STOCK
                                // ------------------------------------------

                                const restoreStockSql = `
                                    UPDATE products
                                    SET qty = qty + ?
                                    WHERE pid = ?
                                `;

                                db.query(
                                    restoreStockSql,
                                    [
                                        requestedQuantity,
                                        productid
                                    ],
                                    (restoreErr) => {

                                        if (restoreErr) {
                                            console.log(
                                                "STOCK RESTORE ERROR:",
                                                restoreErr
                                            );
                                        }

                                        return res.status(500).json({
                                            message:
                                                "Could not place order"
                                        });
                                    }
                                );

                                return;
                            }

                            // ==================================================
                            // SUCCESS
                            // ==================================================

                            return res.status(201).json({

                                message:
                                    "Order placed successfully",

                                orderid:
                                    result.insertId,

                                productid:
                                    productid,

                                productname:
                                    product.productname,

                                quantity:
                                    requestedQuantity,

                                total_amount:
                                    total,

                                payment_method:
                                    payment_method,

                                status:
                                    "Placed"
                            });
                        }
                    );
                }
            );
        }
    );
});


// ======================================================
// CUSTOMER - MY ORDERS
// GET /api/orders/my-orders
// ======================================================

router.get(
    "/my-orders",
    verifyToken,
    (req, res) => {

        // --------------------------------------------------
        // CUSTOMER ONLY
        // --------------------------------------------------

        if (req.user.role !== "customer") {
            return res.status(403).json({
                message:
                    "Only customers can view orders"
            });
        }

        // --------------------------------------------------
        // GET CUSTOMER ORDERS
        //
        // products table:
        // pid
        // name
        // price
        // qty
        // --------------------------------------------------

        const sql = `
            SELECT
                o.orderid,
                o.productid,
                o.quantity,
                o.total_amount,
                o.customer_name,
                o.phone,
                o.address,
                o.payment_method,
                o.status,
                o.created_date,

                p.name AS productname,
                p.price AS productprice

            FROM orders o

            LEFT JOIN products p
                ON o.productid = p.pid

            WHERE o.userid = ?

            ORDER BY o.created_date DESC
        `;

        db.query(
            sql,
            [req.user.userid],
            (err, orders) => {

                // --------------------------------------------------
                // DATABASE ERROR
                // --------------------------------------------------

                if (err) {

                    console.log(
                        "MY ORDERS DATABASE ERROR:",
                        err
                    );

                    return res.status(500).json({
                        message:
                            "Database Error"
                    });
                }

                // --------------------------------------------------
                // SUCCESS
                // --------------------------------------------------

                return res.status(200).json(orders);
            }
        );
    }
);

// ======================================================
// VENDOR - VIEW CUSTOMER ORDERS
// GET /api/orders/vendor-orders
// ======================================================

router.get(
"/vendor-orders",
verifyToken,
(req, res) => {


    // --------------------------------------------------
    // VENDOR ONLY
    // --------------------------------------------------

    if (req.user.role !== "vendor") {
        return res.status(403).json({
            message: "Only vendors can view customer orders"
        });
    }

    // --------------------------------------------------
    // GET ORDERS FOR PRODUCTS BELONGING TO THIS VENDOR
    // --------------------------------------------------

    const sql = `
        SELECT
            o.orderid,
            o.userid,
            o.productid,
            o.quantity,
            o.total_amount,
            o.customer_name,
            o.phone,
            o.address,
            o.payment_method,
            o.status,
            o.created_date,

            p.name AS productname,
            p.price AS productprice,
            p.owner AS vendorid

        FROM orders o

        INNER JOIN products p
            ON o.productid = p.pid

        WHERE p.owner = ?

        ORDER BY o.created_date DESC
    `;

    db.query(
        sql,
        [req.user.userid],
        (err, orders) => {

            if (err) {

                console.log(
                    "VENDOR ORDERS DATABASE ERROR:",
                    err
                );

                return res.status(500).json({
                    message: "Database Error"
                });
            }

            return res.status(200).json({
                orders: orders
            });
        }
    );
}


);

// ======================================================
// VENDOR - UPDATE ORDER STATUS
// PUT /api/orders/:orderid/status
// ======================================================

router.put(
"/:orderid/status",
verifyToken,
(req, res) => {


    // --------------------------------------------------
    // VENDOR ONLY
    // --------------------------------------------------

    if (req.user.role !== "vendor") {
        return res.status(403).json({
            message: "Only vendors can update order status"
        });
    }

    const orderid = req.params.orderid;
    const { status } = req.body;

    // --------------------------------------------------
    // VALID STATUSES
    // --------------------------------------------------

    const validStatuses = [
        "Placed",
        "Confirmed",
        "Shipped",
        "Delivered",
        "Cancelled"
    ];

    if (!status || !validStatuses.includes(status)) {

        return res.status(400).json({
            message:
                "Invalid status. Allowed values: Placed, Confirmed, Shipped, Delivered, Cancelled"
        });
    }

    // --------------------------------------------------
    // UPDATE ONLY IF ORDER BELONGS TO THIS VENDOR
    // --------------------------------------------------

    const sql = `
        UPDATE orders o

        INNER JOIN products p
            ON o.productid = p.pid

        SET o.status = ?

        WHERE o.orderid = ?
        AND p.owner = ?
    `;

    db.query(
        sql,
        [
            status,
            orderid,
            req.user.userid
        ],
        (err, result) => {

            if (err) {

                console.log(
                    "UPDATE ORDER STATUS ERROR:",
                    err
                );

                return res.status(500).json({
                    message: "Database Error"
                });
            }

            // --------------------------------------------------
            // ORDER NOT FOUND / NOT THIS VENDOR'S ORDER
            // --------------------------------------------------

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message:
                        "Order not found or this order does not belong to you."
                });
            }

            return res.status(200).json({

                message:
                    "Order status updated successfully",

                orderid:
                    Number(orderid),

                status:
                    status
            });
        }
    );
}


);

// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;