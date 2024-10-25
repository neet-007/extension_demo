import express from "express"
import fetch from 'node-fetch';
import session from "express-session"
import dotenv from 'dotenv';

dotenv.config();

// initialize express
const app = express();
const PORT = 3000;

//app credentials
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET
const SCOPES = process.env.SCOPES
const APP_URL = process.env.APP_URL;

console.log(SHOPIFY_API_KEY)
console.log(SHOPIFY_API_SECRET)
console.log(SCOPES)
// Use session to store state and access tokens temporarily
app.use(session({
    secret: "1",
    resave: false,
    saveUninitialized: true
}));

// Step 1: Start OAuth and Redirect to Shopify's Authorization URL
// this is to get the code of the shop for shopify to access the access token
app.get('/auth', (req, res) => {
    const shop = req.query.shop;

    if (!shop) {
        return res.status(400).send("Missing shop parameter.");
    }

    //this is like csrf to prevent attacks
    const state = Math.random().toString(36).substring(2);
    req.session.state = state;

    const redirectUri = `${APP_URL}/auth/callback`;
    const authorizationUrl = `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${SCOPES}&redirect_uri=${redirectUri}&state=${state}`;

    res.redirect(authorizationUrl);
});

// Step 2: Handle Shopify Callback and Exchange Code for Access Token
// this is used to get the access key of the venodr shop and should be 
// done once when installing the app and then store it in a db
app.get('/auth/callback', async (req, res) => {
    const { shop, code, state } = req.query;

    // Exchange the code for an access token
    try {
        const accessTokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: SHOPIFY_API_KEY,
                client_secret: SHOPIFY_API_SECRET,
                code
            })
        });

        const accessTokenData = await accessTokenResponse.json();
        const accessToken = accessTokenData.access_token;

        // Store the access token securely (in memory for this example, but use a database for production)
        // this should be to the db
        req.session[shop] = accessToken;

        res.send("Authorization successful! Access token acquired.");
    } catch (error) {
        res.status(500).send("Failed to retrieve access token.");
    }
});

//Step 3: Get Customer Data using Access Token
app.get('/customers/:customerId', async (req, res) => {
    const { shop } = req.query;
    const { customerId } = req.params;

    // Retrieve stored access token
    const accessToken = req.session[shop];
    if (!accessToken) {
        return res.status(401).send("No access token available for this shop. Please reauthorize.");
    }

    try {
        const response = await fetch(`https://${shop}/admin/api/2023-01/customers/${customerId}.json`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching customer data: ${response.statusText}`);
        }

        const customerData = await response.json();
        res.json(customerData)
    } catch (error) {
        res.status(500).send(`Failed to fetch customer data: ${error.message}`);
    }
});

//Step 4: Get Product Data using Access Token
app.get('/products/:id', async (req, res) => {
    const { id } = req.params;
    const shop = req.query.shop;

    if (!shop) {
        return res.status(400).json({ error: 'Shop parameter is required' });
    }

    const accessToken = req.session[shop];
    if (!accessToken) {
        return res.status(401).send("No access token available for this shop. Please reauthorize.");
    }

    try {
        const response = await fetch(`https://${shop}/admin/api/2024-10/products/${id}.json`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken,
            },
        });
        const productData = await response.json()
        res.json(productData);
    } catch (error) {
        console.error('Error fetching product data:', error);
        res.status(500).json({ error: 'Failed to fetch product data' });
    }
});

// Server listen
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
