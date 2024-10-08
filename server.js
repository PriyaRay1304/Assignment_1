/****************************************************************************
* I declare that this assignment is my own work in accordance with the Seneca Academic
* Policy. No part of this assignment has been copied manually or electronically from
* any other source (including web sites) or distributed to other students.
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Assignment: 2247 / 1
* Student Name: Priya Ray
* Student Email: pnray@myseneca.ca
* Course/Section: WEB422/ZAA
* Deployment URL: https://assignment1-7nhvvyhu4-priyaray1304s-projects.vercel.app
*
*****************************************************************************/
//required modules
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

//custom modules
const ListingsDB = require('./modules/listingsDB.js'); // Database operations of listings

//Express app
const app = express();

//instance of ListingsDB
const db = new ListingsDB();

// Middleware setup
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(bodyParser.json()); // Parse incoming requests with JSON payloads

app.use(express.json());

const HTTP_PORT = 8080;

db.initialize(process.env.MONGODB_CONN_STRING).then(() => {
    app.listen(HTTP_PORT, () => {
        console.log(`Server is running on ${HTTP_PORT}`);
    });
}).catch((err) => {
    console.error("Connection failed", err);
});

app.get('/', (req, res) => {
    res.json({ message: "API is listening" });
});


app.post('/api/listings', async (req, res) => {
    try {
        let newListing = await db.addNewListing(req.body);
        res.status(201).json(newListing); 
    } catch (err) {
        res.status(500).json({ error: 'error creating new listing' });
    }
});


app.get('/api/listings', async (req, res) => {
    let { page, perPage, name } = req.query;
    try {
        let listings = await db.getAllListings(page, perPage, name);
        res.status(200).json(listings);
    } catch (err) {
        res.status(500).json({ error: 'error while getting listings',err });
    }
});


app.get('/api/listings/:id', async (req, res) => {
    let { id } = req.params; 
    try {
        let listing = await db.getListingById(id);
        if (listing) {
            res.status(200).json(listing);
        } else {
            res.status(404).json({ error: 'This listing not found for the specific ID' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error getting listing',err});
    }
});


app.put('/api/listings/:id', async (req, res) => {
    let { id } = req.params;
    let updateData = req.body;
    try {
        let Result = await db.updateListingById(updateData, id);
        if (Result.nModified > 0) {
            res.status(200).json({ message: 'Listing successfully updated' });
        } else {
            res.status(404).json({ error: 'Listing with the specified ID not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error updating listing'});
    }
});

app.delete('/api/listings/:id', async (req, res) => {
    let { id } = req.params; 
    try {
        let Result = await db.deleteListingById(id);
        if (Result.deletedCount > 0) {
            res.status(204).send(); 
        } else {
            res.status(404).json({ error: 'listing not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'error deleting listing'});
    }
});



