const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors({
    origin: true
}));
// Test whether the backend is running
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        message: "CalmUI backend is running!"
    });
});

// Simplify text
app.post("/api/simplify", (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({
            error: "Text is required"
        });
    }

    res.json({
        original: text,
        simplified: "This is a simplified version of the text."
    });
});

// Send interaction data to the AI
app.post("/api/recommend-ui", async (req, res) => {
    try {
        const response = await axios.post(
            "http://localhost:8000/api/recommend-ui",
            req.body
        );

        res.json(response.data);
    } catch (error) {
        console.error("AI service error:", error.message);

        res.status(500).json({
            error: "Could not connect to AI service"
        });
    }
});

app.listen(PORT, () => {
    console.log(`CalmUI backend running at http://localhost:${PORT}`);
});
