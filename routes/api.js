const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const dbPath = path.join(__dirname, '../db.json');

// Helper function to read DB
async function readDb() {
    const data = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(data);
}

// Helper function to write DB
async function writeDb(data) {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

// GET all items
router.get('/api/items', async (req, res) => {
    const db = await readDb();
    const itemsHtml = db.items.map(item => `
        <div class="bg-white p-4 rounded-lg shadow mb-4">
            <h3 class="text-xl font-bold">${item.title}</h3>
            <p class="text-gray-600">${item.description}</p>
            <div class="mt-2">
                <button class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        hx-get="/api/items/${item.id}"
                        hx-target="#item-details-${item.id}">
                    View Details
                </button>
                <div id="item-details-${item.id}"></div>
            </div>
        </div>
    `).join('');

    res.send(itemsHtml);
});

// GET single item
router.get('/api/items/:id', async (req, res) => {
    const db = await readDb();
    const item = db.items.find(i => i.id === parseInt(req.params.id));
    if (!item) return res.status(404).send('Item not found');

    res.send(`
        <div class="mt-3 p-4 bg-gray-50 rounded">
            <p class="text-gray-700">${item.description}</p>
            <p class="text-sm text-gray-500">Created: ${new Date(item.created_at).toLocaleString()}</p>
            <button class="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    hx-delete="/api/items/${item.id}"
                    hx-target="closest div"
                    hx-swap="outerHTML">
                Delete
            </button>
        </div>
    `);
});

// POST new item
router.post('/api/items', async (req, res) => {
    const db = await readDb();
    const newItem = {
        id: db.items.length + 1,
        title: req.body.title,
        description: req.body.description,
        created_at: new Date().toISOString()
    };
    
    db.items.push(newItem);
    await writeDb(db);

    res.send(`
        <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
            <p>Item added successfully!</p>
        </div>
    `);
});

// DELETE item
router.delete('/api/items/:id', async (req, res) => {
    const db = await readDb();
    db.items = db.items.filter(item => item.id !== parseInt(req.params.id));
    await writeDb(db);
    
    res.send(`
        <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <p>Item deleted successfully</p>
        </div>
    `);
});

// SEARCH items
router.get('/api/search', async (req, res) => {
    const db = await readDb();
    const query = req.query.q.toLowerCase();
    const results = db.items.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query)
    );

    if (results.length === 0) {
        return res.send(`
            <div class="text-gray-600 p-4">No results found</div>
        `);
    }

    const resultsHtml = results.map(item => `
        <div class="bg-white p-4 rounded-lg shadow mb-2">
            <h4 class="font-bold">${item.title}</h4>
            <p class="text-gray-600">${item.description}</p>
        </div>
    `).join('');

    res.send(resultsHtml);
});

module.exports = router;
