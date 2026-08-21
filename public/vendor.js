
const VENDOR_PRODUCT_API =
    "http://localhost:3000/api/products";

const VENDOR_ORDER_API =
    "http://localhost:3000/api/orders";


// ======================================================
// LOAD MY PRODUCTS
// ======================================================

async function loadMyProducts() {

    const container =
        document.getElementById("myProductsContainer");

    if (!container) {
        console.log("myProductsContainer not found");
        return;
    }

    const token =
        localStorage.getItem("token");

    const role =
        localStorage.getItem("role");


    // LOGIN CHECK
    if (!token) {

        container.innerHTML =
            "<p>Please login first.</p>";

        return;
    }


    // VENDOR CHECK
    if (role !== "vendor") {

        container.innerHTML =
            "<p>Only vendors can access this section.</p>";

        return;
    }


    try {

        console.log("Loading vendor products...");


        const response =
            await fetch(
                VENDOR_PRODUCT_API + "/my-products",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


        const products =
            await response.json();


        console.log(
            "MY PRODUCTS RESPONSE:",
            products
        );


        if (!response.ok) {

            container.innerHTML = `
                <p>
                    ${products.message || "Could not load products."}
                </p>
            `;

            return;
        }


        // NO PRODUCTS
        if (
            !Array.isArray(products) ||
            products.length === 0
        ) {

            container.innerHTML = `
                <div class="empty-orders">

                    <h3>
                        📦 No Products Yet
                    </h3>

                    <p>
                        You have not added any products.
                    </p>

                </div>
            `;

            return;
        }


        let html = "";


        products.forEach(product => {

            html += `

                <div
                    class="vendor-product"
                    style="
                        background:#fff;
                        padding:20px;
                        margin:15px 0;
                        border-radius:12px;
                        box-shadow:0 4px 15px rgba(0,0,0,0.08);
                    "
                >

                    <h3>
                        ${product.name}
                    </h3>


                    <p>
                        ${product.details}
                    </p>


                    <p>
                        <strong>
                            Price:
                        </strong>

                        ₹${Number(product.price).toLocaleString("en-IN")}
                    </p>


                    <p>
                        <strong>
                            Stock:
                        </strong>

                        ${product.qty}
                    </p>


                    <p>
                        <strong>
                            Product ID:
                        </strong>

                        ${product.pid}
                    </p>


                    <div
                        style="
                            display:flex;
                            gap:10px;
                            margin-top:15px;
                            flex-wrap:wrap;
                        "
                    >

                        <button
                            class="form-btn"
                            onclick="
                                editProduct(
                                    ${product.pid},
                                    '${escapeProduct(product.name)}',
                                    ${product.price},
                                    '${escapeProduct(product.details)}',
                                    ${product.qty}
                                )
                            "
                        >
                            ✏️ Edit
                        </button>


                        <button
                            class="form-btn"
                            onclick="
                                deleteProduct(${product.pid})
                            "
                        >
                            🗑️ Delete
                        </button>

                    </div>

                </div>

            `;

        });


        container.innerHTML = html;


    } catch (error) {

        console.error(
            "LOAD MY PRODUCTS ERROR:",
            error
        );


        container.innerHTML = `
            <p>
                Server Error.
                Could not load products.
            </p>
        `;
    }
}



// ======================================================
// ESCAPE PRODUCT TEXT
// ======================================================

function escapeProduct(text) {

    return String(text || "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r");
}



// ======================================================
// EDIT PRODUCT
// ======================================================

async function editProduct(
    productId,
    oldName,
    oldPrice,
    oldDetails,
    oldQty
) {

    const name =
        prompt(
            "Enter product name:",
            oldName
        );


    if (name === null) {
        return;
    }


    const price =
        prompt(
            "Enter product price:",
            oldPrice
        );


    if (price === null) {
        return;
    }


    const details =
        prompt(
            "Enter product description:",
            oldDetails
        );


    if (details === null) {
        return;
    }


    const qty =
        prompt(
            "Enter product quantity:",
            oldQty
        );


    if (qty === null) {
        return;
    }


    // VALIDATION
    if (
        !name.trim() ||
        Number(price) <= 0 ||
        !details.trim() ||
        Number(qty) < 0
    ) {

        alert(
            "Please enter valid product details."
        );

        return;
    }


    const token =
        localStorage.getItem("token");


    try {

        const response =
            await fetch(
                VENDOR_PRODUCT_API +
                "/" +
                productId,
                {
                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " + token
                    },

                    body: JSON.stringify({

                        name:
                            name.trim(),

                        price:
                            Number(price),

                        details:
                            details.trim(),

                        qty:
                            Number(qty)
                    })
                }
            );


        const data =
            await response.json();


        console.log(
            "UPDATE PRODUCT RESPONSE:",
            data
        );


        if (!response.ok) {

            alert(
                data.message ||
                "Product update failed."
            );

            return;
        }


        alert(
            "Product updated successfully!"
        );


        loadMyProducts();


    } catch (error) {

        console.error(
            "UPDATE PRODUCT ERROR:",
            error
        );


        alert(
            "Server Error."
        );
    }
}



// ======================================================
// DELETE PRODUCT
// ======================================================

async function deleteProduct(productId) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this product?"
        );


    if (!confirmDelete) {
        return;
    }


    const token =
        localStorage.getItem("token");


    try {

        const response =
            await fetch(
                VENDOR_PRODUCT_API +
                "/" +
                productId,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "DELETE PRODUCT RESPONSE:",
            data
        );


        if (!response.ok) {

            alert(
                data.message ||
                "Product deletion failed."
            );

            return;
        }


        alert(
            "Product deleted successfully!"
        );


        loadMyProducts();


    } catch (error) {

        console.error(
            "DELETE PRODUCT ERROR:",
            error
        );


        alert(
            "Server Error."
        );
    }
}



// ======================================================
// LOAD VENDOR ORDERS
// ======================================================

async function loadVendorOrders() {

    const container =
        document.getElementById(
            "vendorOrdersContainer"
        );


    if (!container) {

        console.log(
            "vendorOrdersContainer not found"
        );

        return;
    }


    const token =
        localStorage.getItem("token");

    const role =
        localStorage.getItem("role");


    // LOGIN CHECK
    if (!token) {

        container.innerHTML =
            "<p>Please login first.</p>";

        return;
    }


    // VENDOR CHECK
    if (role !== "vendor") {

        container.innerHTML =
            "<p>Only vendors can view customer orders.</p>";

        return;
    }


    try {

        console.log(
            "Loading vendor orders..."
        );


        const response =
            await fetch(
                VENDOR_ORDER_API +
                "/vendor-orders",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "VENDOR ORDERS RESPONSE:",
            data
        );


        if (!response.ok) {

            container.innerHTML = `
                <p>
                    ${data.message || "Could not load orders."}
                </p>
            `;

            return;
        }


        const orders =
            Array.isArray(data)
                ? data
                : data.orders || [];


        // NO ORDERS
        if (orders.length === 0) {

            container.innerHTML = `

                <div class="empty-orders">

                    <h3>
                        📦 No Customer Orders Yet
                    </h3>

                    <p>
                        No customers have ordered your products yet.
                    </p>

                </div>

            `;

            return;
        }


        let html = "";


        orders.forEach(order => {

            const total =
                Number(
                    order.total_amount || 0
                );


            const currentStatus =
                order.status || "Placed";


            html += `

                <div
                    class="vendor-order-card"
                    style="
                        background:#fff;
                        padding:25px;
                        margin:20px 0;
                        border-radius:15px;
                        box-shadow:0 5px 20px rgba(0,0,0,0.08);
                    "
                >

                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            align-items:center;
                            flex-wrap:wrap;
                            gap:10px;
                        "
                    >

                        <h3>
                            📦 Order #${order.orderid}
                        </h3>


                        <strong>
                            ${currentStatus}
                        </strong>

                    </div>


                    <hr>


                    <h3>
                        ${order.productname || "Product"}
                    </h3>


                    <p>

                        <strong>
                            Quantity:
                        </strong>

                        ${order.quantity}

                    </p>


                    <p>

                        <strong>
                            Total:
                        </strong>

                        ₹${total.toLocaleString("en-IN")}

                    </p>


                    <p>

                        <strong>
                            Customer:
                        </strong>

                        ${order.customer_name || "N/A"}

                    </p>


                    <p>

                        <strong>
                            Phone:
                        </strong>

                        ${order.phone || "N/A"}

                    </p>


                    <p>

                        <strong>
                            Address:
                        </strong>

                        ${order.address || "N/A"}

                    </p>


                    <p>

                        <strong>
                            Payment:
                        </strong>

                        ${order.payment_method || "N/A"}

                    </p>


                    <p>

                        <strong>
                            Order Date:
                        </strong>

                        ${
                            order.created_date
                                ? new Date(
                                    order.created_date
                                ).toLocaleString("en-IN")
                                : "N/A"
                        }

                    </p>


                    <!-- STATUS UPDATE -->

                    <div
                        style="
                            margin-top:20px;
                            padding-top:15px;
                            border-top:1px solid #eee;
                        "
                    >

                        <label
                            for="status-${order.orderid}"
                        >

                            <strong>
                                Update Status:
                            </strong>

                        </label>


                        <select
                            id="status-${order.orderid}"
                            style="
                                padding:8px;
                                margin-left:10px;
                                border-radius:6px;
                            "
                        >

                            <option
                                value="Placed"
                                ${currentStatus === "Placed" ? "selected" : ""}
                            >
                                Placed
                            </option>


                            <option
                                value="Confirmed"
                                ${currentStatus === "Confirmed" ? "selected" : ""}
                            >
                                Confirmed
                            </option>


                            <option
                                value="Shipped"
                                ${currentStatus === "Shipped" ? "selected" : ""}
                            >
                                Shipped
                            </option>


                            <option
                                value="Delivered"
                                ${currentStatus === "Delivered" ? "selected" : ""}
                            >
                                Delivered
                            </option>


                            <option
                                value="Cancelled"
                                ${currentStatus === "Cancelled" ? "selected" : ""}
                            >
                                Cancelled
                            </option>

                        </select>


                        <button
                            class="form-btn"
                            style="margin-left:10px;"
                            onclick="
                                updateOrderStatus(
                                    ${order.orderid}
                                )
                            "
                        >
                            Update Status
                        </button>

                    </div>

                </div>

            `;

        });


        container.innerHTML = html;


    } catch (error) {

        console.error(
            "LOAD VENDOR ORDERS ERROR:",
            error
        );


        container.innerHTML = `

            <p>
                Server Error.
                Could not load customer orders.
            </p>

        `;
    }
}



// ======================================================
// UPDATE ORDER STATUS
// ======================================================

async function updateOrderStatus(orderid) {

    const select =
        document.getElementById(
            "status-" + orderid
        );


    if (!select) {

        alert(
            "Status selector not found."
        );

        return;
    }


    const status =
        select.value;


    const token =
        localStorage.getItem("token");


    if (!token) {

        alert(
            "Please login first."
        );

        window.location.href =
            "login.html";

        return;
    }


    try {

        const response =
            await fetch(
                VENDOR_ORDER_API +
                "/" +
                orderid +
                "/status",
                {
                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " + token
                    },

                    body: JSON.stringify({
                        status: status
                    })
                }
            );


        const data =
            await response.json();


        console.log(
            "UPDATE ORDER STATUS RESPONSE:",
            data
        );


        if (!response.ok) {

            alert(
                data.message ||
                "Could not update order status."
            );

            return;
        }


        alert(
            "Order status updated successfully!"
        );


        loadVendorOrders();


    } catch (error) {

        console.error(
            "UPDATE ORDER STATUS ERROR:",
            error
        );


        alert(
            "Server Error."
        );
    }
}



// ======================================================
// LOAD VENDOR PAGE
// ======================================================

window.addEventListener(
    "load",
    function () {

        console.log(
            "Vendor page loaded"
        );

        loadMyProducts();

        loadVendorOrders();

    }
);