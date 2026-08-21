// ======================================================
// ShopEase - script.js
// Complete Frontend JavaScript
// ======================================================


// ======================================================
// API URLS
// ======================================================

const API_URL = "http://localhost:3000/api/users";
const PRODUCT_API_URL = "http://localhost:3000/api/products";
const ORDER_API_URL = "http://localhost:3000/api/orders";


// ======================================================
// SIGNUP
// ======================================================

async function signup() {

    const usernameElement = document.getElementById("username");
    const emailElement = document.getElementById("emailid");
    const phoneElement = document.getElementById("phone");
    const passwordElement = document.getElementById("password");
    const roleElement = document.getElementById("role");
    const message = document.getElementById("message");

    if (
        !usernameElement ||
        !emailElement ||
        !phoneElement ||
        !passwordElement ||
        !roleElement ||
        !message
    ) {
        console.error("Signup elements not found.");
        return;
    }

    const username = usernameElement.value.trim();
    const emailid = emailElement.value.trim();
    const phone = phoneElement.value.trim();
    const password = passwordElement.value;
    const role = roleElement.value;

    if (!username || !emailid || !phone || !password || !role) {

        message.innerText = "Please fill all fields.";
        message.style.color = "red";

        return;
    }

    try {

        const response = await fetch(
            API_URL + "/signup",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username: username,
                    emailid: emailid,
                    phone: phone,
                    password: password,
                    role: role
                })
            }
        );

        const data = await response.json();

        message.innerText =
            data.message || "Signup completed.";

        if (response.ok) {

            message.style.color = "green";

            setTimeout(() => {

                window.location.href = "login.html";

            }, 1500);

        } else {

            message.style.color = "red";
        }

    } catch (error) {

        console.error("SIGNUP ERROR:", error);

        message.innerText = "Server Error.";
        message.style.color = "red";
    }
}


// ======================================================
// LOGIN
// ======================================================

async function login() {

    const emailElement =
        document.getElementById("loginEmail");

    const passwordElement =
        document.getElementById("loginPassword");

    const message =
        document.getElementById("message");


    if (!emailElement || !passwordElement || !message) {

        console.error("Login elements not found.");

        return;
    }


    const emailid =
        emailElement.value.trim();

    const password =
        passwordElement.value;


    if (!emailid || !password) {

        message.innerText =
            "Please enter Email and Password.";

        message.style.color = "red";

        return;
    }


    try {

        const response =
            await fetch(
                API_URL + "/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        emailid: emailid,
                        password: password
                    })
                }
            );


        const data =
            await response.json();


        console.log(
            "LOGIN RESPONSE:",
            data
        );


        if (response.ok) {

            // Save login information
            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "role",
                data.role
            );


            console.log(
                "TOKEN SAVED:",
                localStorage.getItem("token")
            );

            console.log(
                "ROLE SAVED:",
                localStorage.getItem("role")
            );


            message.innerText =
                "Login Successful.";

            message.style.color =
                "green";


            setTimeout(() => {

                if (data.role === "vendor") {

                    window.location.href =
                        "vendor.html";

                } else {

                    window.location.href =
                        "index.html";
                }

            }, 1000);


        } else {

            message.innerText =
                data.message ||
                "Login failed.";

            message.style.color =
                "red";
        }


    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        message.innerText =
            "Server Error.";

        message.style.color =
            "red";
    }
}


// ======================================================
// LOAD PROFILE
// ======================================================

async function loadProfile() {

    const token =
        localStorage.getItem("token");


    if (!token) {

        window.location.href =
            "login.html";

        return;
    }


    try {

        const response =
            await fetch(
                API_URL + "/profile",
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
            "PROFILE RESPONSE:",
            data
        );


        if (response.ok && data.user) {

            const useridElement =
                document.getElementById("userid");

            const roleElement =
                document.getElementById("role");


            if (useridElement) {

                useridElement.innerText =
                    data.user.userid;
            }


            if (roleElement) {

                roleElement.innerText =
                    data.user.role;
            }


        } else {

            localStorage.removeItem("token");
            localStorage.removeItem("role");

            window.location.href =
                "login.html";
        }


    } catch (error) {

        console.error(
            "PROFILE ERROR:",
            error
        );


        localStorage.removeItem("token");
        localStorage.removeItem("role");

        window.location.href =
            "login.html";
    }
}


// ======================================================
// ADD PRODUCT - VENDOR
// ======================================================

async function addProduct(event) {

    event.preventDefault();


    const nameElement =
        document.getElementById("name");

    const priceElement =
        document.getElementById("price");

    const detailsElement =
        document.getElementById("details");

    const qtyElement =
        document.getElementById("qty");

    const message =
        document.getElementById("message");


    if (
        !nameElement ||
        !priceElement ||
        !detailsElement ||
        !qtyElement ||
        !message
    ) {

        console.error(
            "Product form elements not found."
        );

        return;
    }


    const name =
        nameElement.value.trim();

    const price =
        priceElement.value;

    const details =
        detailsElement.value.trim();

    const qty =
        qtyElement.value;


    const token =
        localStorage.getItem("token");

    const role =
        localStorage.getItem("role");


    // --------------------------------------------------
    // LOGIN CHECK
    // --------------------------------------------------

    if (!token) {

        alert(
            "Please login first."
        );

        window.location.href =
            "login.html";

        return;
    }


    // --------------------------------------------------
    // VENDOR CHECK
    // --------------------------------------------------

    if (role !== "vendor") {

        alert(
            "Only vendors can add products."
        );

        window.location.href =
            "profile.html";

        return;
    }


    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    if (
        !name ||
        !price ||
        !details ||
        !qty
    ) {

        message.innerText =
            "Please fill all product fields.";

        message.style.color =
            "red";

        return;
    }


    try {

        const response =
            await fetch(
                PRODUCT_API_URL,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " + token
                    },

                    body: JSON.stringify({

                        name: name,

                        price:
                            Number(price),

                        details:
                            details,

                        qty:
                            Number(qty)
                    })
                }
            );


        const data =
            await response.json();


        console.log(
            "ADD PRODUCT RESPONSE:",
            data
        );


        if (response.ok) {

            message.innerText =
                "Product added successfully!";

            message.style.color =
                "green";


            const productForm =
                document.getElementById(
                    "productForm"
                );


            if (productForm) {

                productForm.reset();
            }


            loadProducts();


        } else {

            message.innerText =
                data.message ||
                "Product could not be added.";

            message.style.color =
                "red";
        }


    } catch (error) {

        console.error(
            "PRODUCT ERROR:",
            error
        );

        message.innerText =
            "Server Error.";

        message.style.color =
            "red";
    }
}


// ======================================================
// LOAD PRODUCTS
// ======================================================

async function loadProducts() {

    const productList =
        document.getElementById(
            "productList"
        );


    if (!productList) {

        return;
    }


    try {

        const response =
            await fetch(
                PRODUCT_API_URL
            );


        const products =
            await response.json();


        console.log(
            "PRODUCTS RESPONSE:",
            products
        );


        if (!Array.isArray(products)) {

            console.error(
                "Invalid product response:",
                products
            );

            productList.innerHTML =
                "<p>Unable to load products.</p>";

            return;
        }


        if (products.length === 0) {

            productList.innerHTML =
                "<p>No products available.</p>";

            return;
        }


        let html = "";


        products.forEach(product => {

            const productId =
                product.pid ||
                product.productid;


            const productName =
                product.name ||
                product.productname ||
                "Product";


            const productDetails =
                product.details ||
                product.description ||
                "";


            const productPrice =
                Number(
                    product.price || 0
                );


            const productQty =
                product.qty ??
                product.stock ??
                0;


            html += `

                <div class="product-card">

                    <h3>
                        ${productName}
                    </h3>

                    <p>
                        ${productDetails}
                    </p>

                    <div class="price">
                        ₹${productPrice.toLocaleString("en-IN")}
                    </div>

                    <p>
                        Stock: ${productQty}
                    </p>

                    <button
                        onclick='addToCart(${JSON.stringify(product)})'
                    >
                        Add To Cart
                    </button>

                </div>

            `;
        });


        productList.innerHTML =
            html;


    } catch (error) {

        console.error(
            "LOAD PRODUCTS ERROR:",
            error
        );


        productList.innerHTML =
            "<p>Server Error. Could not load products.</p>";
    }
}


// ======================================================
// GET CART
// ======================================================

function getCart() {

    try {

        return JSON.parse(
            localStorage.getItem("cart")
        ) || [];

    } catch (error) {

        console.error(
            "CART ERROR:",
            error
        );

        return [];
    }
}


// ======================================================
// ADD TO CART
// ======================================================

function addToCart(product) {

    console.log("PRODUCT RECEIVED:", product);

    if (!product) {
        alert("Product data not found.");
        return;
    }

    const productId =
        product.pid ??
        product.productid;

    if (!productId) {
        console.error("PRODUCT ID MISSING:", product);
        alert("Product ID not found.");
        return;
    }

    let cart = getCart();

    console.log("CART BEFORE:", cart);

    const existingIndex = cart.findIndex(
        item =>
            Number(item.productid) ===
            Number(productId)
    );

    if (existingIndex !== -1) {

        cart[existingIndex].quantity =
            Number(cart[existingIndex].quantity || 0) + 1;

    } else {

        cart.push({
            productid: Number(productId),

            productname:
                product.name ??
                product.productname ??
                "Product",

            price:
                Number(product.price ?? 0),

            quantity: 1
        });
    }

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

    console.log(
        "CART AFTER:",
        localStorage.getItem("cart")
    );

    updateCartCount();

    alert("Product added to cart!");

    window.location.href = "cart.html";
}

// ======================================================
// UPDATE CART COUNT
// ======================================================

function updateCartCount() {

    const cart =
        getCart();


    const count =
        cart.reduce(
            (total, item) => {

                return total +
                    Number(
                        item.quantity || 0
                    );

            },
            0
        );


    const cartCount =
        document.getElementById(
            "cartCount"
        );


    if (cartCount) {

        cartCount.innerText =
            count;
    }
}


// ======================================================
// LOAD CART PAGE
// ======================================================

function loadCart() {

    const cartContainer =
        document.getElementById(
            "cartItems"
        );


    if (!cartContainer) {

        return;
    }


    const cart =
        getCart();


    if (cart.length === 0) {

        cartContainer.innerHTML = `

            <div class="cart-item">

                <h3>
                    Your cart is empty.
                </h3>

                <button
                    class="form-btn"
                    onclick="window.location.href='index.html'"
                >
                    Continue Shopping
                </button>

            </div>

        `;


        updateCartTotal();

        return;
    }


    let html = "";


    cart.forEach(
        (item, index) => {

            html += `

                <div class="cart-item">

                    <div>

                        <h3>
                            ${item.productname}
                        </h3>

                        <p>
                            Price:
                            ₹${Number(item.price).toLocaleString("en-IN")}
                        </p>

                        <div>

                            <button
                                onclick="decreaseQuantity(${index})"
                            >
                                -
                            </button>

                            <span
                                style="
                                    margin: 0 15px;
                                    font-weight: bold;
                                "
                            >
                                ${item.quantity}
                            </span>

                            <button
                                onclick="increaseQuantity(${index})"
                            >
                                +
                            </button>

                        </div>

                        <br>

                        <button
                            onclick="removeFromCart(${index})"
                        >
                            Remove
                        </button>

                    </div>

                </div>

            `;
        }
    );


    cartContainer.innerHTML =
        html;


    updateCartTotal();
}


// ======================================================
// INCREASE CART QUANTITY
// ======================================================

function increaseQuantity(index) {

    const cart =
        getCart();


    if (!cart[index]) {

        return;
    }


    cart[index].quantity =
        Number(
            cart[index].quantity
        ) + 1;


    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    loadCart();

    updateCartCount();
}


// ======================================================
// DECREASE CART QUANTITY
// ======================================================

function decreaseQuantity(index) {

    const cart =
        getCart();


    if (!cart[index]) {

        return;
    }


    if (
        Number(cart[index].quantity) > 1
    ) {

        cart[index].quantity--;

    } else {

        cart.splice(index, 1);
    }


    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    loadCart();

    updateCartCount();
}


// ======================================================
// REMOVE FROM CART
// ======================================================

function removeFromCart(index) {

    const cart =
        getCart();


    if (!cart[index]) {

        return;
    }


    cart.splice(index, 1);


    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    loadCart();

    updateCartCount();
}


// ======================================================
// UPDATE CART TOTAL
// ======================================================

function updateCartTotal() {

    const cart =
        getCart();


    const total =
        cart.reduce(
            (sum, item) => {

                return sum +
                    Number(item.price || 0) *
                    Number(item.quantity || 0);

            },
            0
        );


    const cartTotal =
        document.getElementById(
            "cartTotal"
        );


    if (cartTotal) {

        cartTotal.innerText =
            "Total: ₹" +
            total.toLocaleString("en-IN");
    }
}


// ======================================================
// LOAD CHECKOUT
// ======================================================

function loadCheckout() {

    const checkoutTotal =
        document.getElementById(
            "checkoutTotal"
        );


    if (!checkoutTotal) {

        return;
    }


    const cart =
        getCart();


    if (cart.length === 0) {

        checkoutTotal.innerText =
            "Your cart is empty.";

        return;
    }


    const total =
        cart.reduce(
            (sum, item) => {

                return sum +
                    Number(item.price || 0) *
                    Number(item.quantity || 0);

            },
            0
        );


    checkoutTotal.innerText =
        "Total: ₹" +
        total.toLocaleString("en-IN");
}


// ======================================================
// PLACE ORDER
// ======================================================

async function placeOrder() {

    const message =
        document.getElementById(
            "checkoutMessage"
        );


    const token =
        localStorage.getItem("token");


    if (!message) {

        console.error(
            "checkoutMessage element not found."
        );

        return;
    }


    if (!token) {

        message.innerText =
            "Please login before placing an order.";

        message.style.color =
            "red";


        setTimeout(() => {

            window.location.href =
                "login.html";

        }, 1000);


        return;
    }


    const role =
        localStorage.getItem("role");


    if (role !== "customer") {

        message.innerText =
            "Only customers can place orders.";

        message.style.color =
            "red";

        return;
    }


    const nameElement =
        document.getElementById(
            "customerName"
        );


    const phoneElement =
        document.getElementById(
            "customerPhone"
        );


    const addressElement =
        document.getElementById(
            "customerAddress"
        );


    const paymentElement =
        document.getElementById(
            "paymentMethod"
        );


    if (
        !nameElement ||
        !phoneElement ||
        !addressElement ||
        !paymentElement
    ) {

        message.innerText =
            "Checkout fields not found.";

        message.style.color =
            "red";

        return;
    }


    const name =
        nameElement.value.trim();

    const phone =
        phoneElement.value.trim();

    const address =
        addressElement.value.trim();

    const paymentMethod =
        paymentElement.value;


    // --------------------------------------------------
    // DELIVERY VALIDATION
    // --------------------------------------------------

    if (
        !name ||
        !phone ||
        !address
    ) {

        message.innerText =
            "Please fill all delivery details.";

        message.style.color =
            "red";

        return;
    }


    // --------------------------------------------------
    // PHONE VALIDATION
    // --------------------------------------------------

    if (
        !/^[0-9]{10}$/.test(phone)
    ) {

        message.innerText =
            "Please enter a valid 10-digit phone number.";

        message.style.color =
            "red";

        return;
    }


    const cart =
        getCart();


    if (cart.length === 0) {

        message.innerText =
            "Your cart is empty.";

        message.style.color =
            "red";

        return;
    }


    // --------------------------------------------------
    // ONLINE PAYMENT DEMO
    // --------------------------------------------------

    if (
        paymentMethod === "ONLINE"
    ) {

        const confirmPayment =
            confirm(
                "Online Payment\n\n" +
                "This is a demo payment.\n" +
                "Click OK to simulate successful payment."
            );


        if (!confirmPayment) {

            message.innerText =
                "Payment cancelled.";

            message.style.color =
                "red";

            return;
        }
    }


    // --------------------------------------------------
    // PLACE ORDERS
    // --------------------------------------------------

    try {

        message.innerText =
            "Placing your order...";

        message.style.color =
            "black";


        for (
            const item of cart
        ) {

            const response =
                await fetch(
                    ORDER_API_URL,
                    {
                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                "Bearer " + token
                        },

                        body: JSON.stringify({

                            productid:
                                Number(
                                    item.productid
                                ),

                            quantity:
                                Number(
                                    item.quantity
                                ),

                            customer_name:
                                name,

                            phone:
                                phone,

                            address:
                                address,

                            payment_method:
                                paymentMethod
                        })
                    }
                );


            const data =
                await response.json();


            console.log(
                "ORDER RESPONSE:",
                data
            );


            if (!response.ok) {

                message.innerText =
                    data.message ||
                    "Order could not be placed.";

                message.style.color =
                    "red";

                return;
            }
        }


        // --------------------------------------------------
        // ORDER SUCCESS
        // --------------------------------------------------

        localStorage.removeItem(
            "cart"
        );


        updateCartCount();


        message.innerText =
            "Order placed successfully!";

        message.style.color =
            "green";


        setTimeout(() => {

            window.location.href =
                "order-success.html";

        }, 1500);


    } catch (error) {

        console.error(
            "ORDER ERROR:",
            error
        );


        message.innerText =
            "Server Error. Please try again.";

        message.style.color =
            "red";
    }
}


// ======================================================
// GET CUSTOMER ORDERS FROM API
// ======================================================

async function getMyOrders() {

    const token =
        localStorage.getItem("token");


    if (!token) {

        return [];
    }


    try {

        const response =
            await fetch(
                ORDER_API_URL +
                "/my-orders",
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
            "MY ORDERS API RESPONSE:",
            data
        );


        if (!response.ok) {

            console.error(
                "MY ORDERS API ERROR:",
                data
            );

            return [];
        }


        /*
         * Supports both:
         *
         * 1. API returns:
         *    [ order1, order2 ]
         *
         * 2. API returns:
         *    { orders: [ order1, order2 ] }
         */


        if (Array.isArray(data)) {

            return data;
        }


        if (Array.isArray(data.orders)) {

            return data.orders;
        }


        return [];


    } catch (error) {

        console.error(
            "GET MY ORDERS ERROR:",
            error
        );

        return [];
    }
}


// ======================================================
// LOAD CUSTOMER ORDERS PAGE
// ======================================================

async function loadMyOrders() {

    /*
     * Your my-orders.html may use either:
     *
     * id="myOrders"
     *
     * OR
     *
     * id="ordersContainer"
     *
     * So we support both.
     */


    const ordersContainer =
        document.getElementById(
            "myOrders"
        ) ||
        document.getElementById(
            "ordersContainer"
        );


    if (!ordersContainer) {

        return;
    }


    const token =
        localStorage.getItem("token");

    const role =
        localStorage.getItem("role");


    // --------------------------------------------------
    // LOGIN CHECK
    // --------------------------------------------------

    if (!token) {

        ordersContainer.innerHTML = `

            <p>
                Please login to view your orders.
            </p>

        `;


        setTimeout(() => {

            window.location.href =
                "login.html";

        }, 1000);


        return;
    }


    // --------------------------------------------------
    // CUSTOMER CHECK
    // --------------------------------------------------

    if (role !== "customer") {

        ordersContainer.innerHTML = `

            <p>
                Only customers can view orders.
            </p>

        `;

        return;
    }


    ordersContainer.innerHTML = `

        <p>
            Loading orders...
        </p>

    `;


    const orders =
        await getMyOrders();


    // --------------------------------------------------
    // NO ORDERS
    // --------------------------------------------------

    if (orders.length === 0) {

        ordersContainer.innerHTML = `

            <div class="empty-orders">

                <h2>
                    📦 No Orders Yet
                </h2>

                <p>
                    You have not placed any orders yet.
                </p>

                <button
                    class="form-btn"
                    onclick="window.location.href='index.html'"
                >
                    Start Shopping
                </button>

            </div>

        `;

        return;
    }


    // --------------------------------------------------
    // DISPLAY ORDERS
    // --------------------------------------------------

    let html = "";


    orders.forEach(order => {

        const productName =
            order.productname ||
            order.product_name ||
            "Product";


        const totalAmount =
            Number(
                order.total_amount || 0
            );


        const orderDate =
            order.created_date
                ? new Date(
                    order.created_date
                ).toLocaleString("en-IN")
                : "N/A";


        html += `

            <div
                class="order-card"
                style="
                    background:white;
                    padding:25px;
                    margin-bottom:20px;
                    border-radius:15px;
                    box-shadow:0 5px 20px rgba(0,0,0,0.08);
                "
            >

                <div
                    class="order-header"
                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        gap:15px;
                        flex-wrap:wrap;
                    "
                >

                    <h3>
                        📦 Order #${order.orderid}
                    </h3>

                    <span
                        class="order-status"
                    >
                        ${order.status || "Placed"}
                    </span>

                </div>


                <hr>


                <h3>
                    ${productName}
                </h3>


                <p>
                    <strong>Quantity:</strong>
                    ${order.quantity || 1}
                </p>


                <p>
                    <strong>Total:</strong>
                    ₹${totalAmount.toLocaleString("en-IN")}
                </p>


                <p>
                    <strong>Payment:</strong>
                    ${order.payment_method || "N/A"}
                </p>


                <p>
                    <strong>Customer:</strong>
                    ${order.customer_name || "N/A"}
                </p>


                <p>
                    <strong>Phone:</strong>
                    ${order.phone || "N/A"}
                </p>


                <p>
                    <strong>Address:</strong>
                    ${order.address || "N/A"}
                </p>


                <p>
                    <strong>Order Date:</strong>
                    ${orderDate}
                </p>

            </div>

        `;
    });


    ordersContainer.innerHTML =
        html;
}


// ======================================================
// LOAD PURCHASED PRODUCTS ON PROFILE
// ======================================================

async function loadProfileOrders() {

    const ordersContainer =
        document.getElementById(
            "profileOrders"
        );


    if (!ordersContainer) {

        return;
    }


    const token =
        localStorage.getItem("token");

    const role =
        localStorage.getItem("role");


    // --------------------------------------------------
    // LOGIN CHECK
    // --------------------------------------------------

    if (!token) {

        ordersContainer.innerHTML = `

            <p>
                Please login to view your purchased products.
            </p>

        `;

        return;
    }


    // --------------------------------------------------
    // CUSTOMER ONLY
    // --------------------------------------------------

    if (role !== "customer") {

        const section =
            document.getElementById(
                "customerOrdersSection"
            );


        if (section) {

            section.style.display =
                "none";
        }


        return;
    }


    ordersContainer.innerHTML = `

        <p>
            Loading your purchased products...
        </p>

    `;


    const orders =
        await getMyOrders();


    // --------------------------------------------------
    // NO PURCHASES
    // --------------------------------------------------

    if (orders.length === 0) {

        ordersContainer.innerHTML = `

            <div class="profile-no-orders">

                <h3>
                    🛍️ No Purchased Products Yet
                </h3>

                <p>
                    You have not purchased any products yet.
                </p>

                <button
                    class="form-btn"
                    onclick="window.location.href='index.html'"
                >
                    Start Shopping
                </button>

            </div>

        `;

        return;
    }


    // --------------------------------------------------
    // DISPLAY PURCHASED PRODUCTS
    // --------------------------------------------------

    let html = "";


    orders.forEach(order => {

        const productName =
            order.productname ||
            order.product_name ||
            "Product";


        const quantity =
            Number(
                order.quantity || 1
            );


        const total =
            Number(
                order.total_amount || 0
            );


        const status =
            order.status ||
            "Placed";


        const payment =
            order.payment_method ||
            "N/A";


        const orderDate =
            order.created_date
                ? new Date(
                    order.created_date
                ).toLocaleString("en-IN")
                : "N/A";


        html += `

            <div
                class="profile-order-card"
                style="
                    background:white;
                    padding:20px;
                    margin:15px 0;
                    border-radius:15px;
                    box-shadow:0 5px 20px rgba(0,0,0,0.08);
                    text-align:left;
                "
            >

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        gap:15px;
                        flex-wrap:wrap;
                    "
                >

                    <h3>
                        📦 ${productName}
                    </h3>

                    <span
                        style="
                            padding:6px 14px;
                            border-radius:20px;
                            background:#e8f5e9;
                            color:#2e7d32;
                            font-weight:600;
                        "
                    >
                        ${status}
                    </span>

                </div>


                <p>
                    <strong>Order ID:</strong>
                    #${order.orderid}
                </p>


                <p>
                    <strong>Quantity:</strong>
                    ${quantity}
                </p>


                <p>
                    <strong>Total Amount:</strong>
                    ₹${total.toLocaleString("en-IN")}
                </p>


                <p>
                    <strong>Payment:</strong>
                    ${payment}
                </p>


                <p>
                    <strong>Delivery Name:</strong>
                    ${order.customer_name || "N/A"}
                </p>


                <p>
                    <strong>Phone:</strong>
                    ${order.phone || "N/A"}
                </p>


                <p>
                    <strong>Address:</strong>
                    ${order.address || "N/A"}
                </p>


                <p>
                    <strong>Order Date:</strong>
                    ${orderDate}
                </p>

            </div>

        `;
    });


    ordersContainer.innerHTML =
        html;
}


// ======================================================
// LOGOUT
// ======================================================

function logout() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "role"
    );


    // We intentionally keep cart data.
    // Customer cart is separate from login.


    alert(
        "Logged out successfully."
    );


    window.location.href =
        "login.html";
}


// ======================================================
// VENDOR PAGE PROTECTION
// ======================================================

function checkVendorAccess() {

    const token =
        localStorage.getItem("token");

    const role =
        localStorage.getItem("role");


    if (
        !token ||
        role !== "vendor"
    ) {

        alert(
            "Vendor login required."
        );


        window.location.href =
            "login.html";


        return false;
    }


    return true;
}


// ======================================================
// AUTO LOAD
// ======================================================

window.addEventListener(
    "load",
    function () {


        // --------------------------------------------------
        // PROFILE PAGE
        // --------------------------------------------------

        if (
            window.location.pathname.includes(
                "profile.html"
            )
        ) {

            loadProfile();

            loadProfileOrders();
        }


        // --------------------------------------------------
        // VENDOR PAGE
        // --------------------------------------------------

        if (
            window.location.pathname.includes(
                "vendor.html"
            )
        ) {

            if (
                checkVendorAccess()
            ) {

                const productForm =
                    document.getElementById(
                        "productForm"
                    );


                if (productForm) {

                    /*
                     * Prevent duplicate submit
                     * event listeners.
                     */

                    productForm.onsubmit =
                        addProduct;
                }
            }
        }


        // --------------------------------------------------
        // CART PAGE
        // --------------------------------------------------

        if (
            window.location.pathname.includes(
                "cart.html"
            )
        ) {

            loadCart();
        }


        // --------------------------------------------------
        // CHECKOUT PAGE
        // --------------------------------------------------

        if (
            window.location.pathname.includes(
                "checkout.html"
            )
        ) {

            loadCheckout();
        }


        // --------------------------------------------------
        // MY ORDERS PAGE
        // --------------------------------------------------

        if (
            window.location.pathname.includes(
                "my-orders.html"
            )
        ) {

            loadMyOrders();
        }


        // --------------------------------------------------
        // HOME PAGE / PRODUCT PAGE
        // --------------------------------------------------

        loadProducts();


        // --------------------------------------------------
        // CART COUNT
        // --------------------------------------------------

        updateCartCount();

    }
);