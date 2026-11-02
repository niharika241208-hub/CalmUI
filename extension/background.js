console.log("CalmUI background worker loaded");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("CalmUI background received message:", message);

    if (message.type === "GET_AI_RECOMMENDATION") {
        console.log("CalmUI background received AI request");

        fetch("http://localhost:3000/api/recommend-ui", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(message.data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Backend returned ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("CalmUI AI response:", data);
            sendResponse({
                success: true,
                data: data
            });
        })
        .catch(error => {
            console.error("CalmUI AI connection failed:", error);

            sendResponse({
                success: false,
                error: error.message
            });
        });

        return true;
    }

    return false;
});