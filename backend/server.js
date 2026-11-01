const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        message: "CalmUI backend is running!"
    });
});

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

app.listen(PORT, () => {
    console.log(`CalmUI backend running at http://localhost:${PORT}`);
});