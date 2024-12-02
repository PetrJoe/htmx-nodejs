const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const app = express();
const port = 3000;

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving
app.use(express.static('public'));
app.use('/content', express.static('content'));

// API routes
app.use('/', apiRoutes);

// Default route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send(`
        <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p>Something went wrong! Please try again.</p>
        </div>
    `);
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});