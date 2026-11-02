



const defaults = {
  largeText: false,
  spacing: false,
  motion: false,
  simple: false,
  language: false
};

const settingIds = [
  "largeText",
  "spacing",
  "motion",
  "simple",
  "language"
];

// Load saved settings
async function loadSettings() {
  try {
    const saved = await chrome.storage.sync.get(defaults);

    settingIds.forEach(id => {
      document.getElementById(id).checked = saved[id];
    });

  } catch (error) {
    console.error("Error loading settings:", error);
  }
}

// Apply Preferences button
document.getElementById("applyButton").addEventListener(
  "click",
  async () => {

    const settings = {};

    // Get all checkbox values
    settingIds.forEach(id => {
      settings[id] =
        document.getElementById(id).checked;
    });

    try {
      // Save preferences
      await chrome.storage.sync.set(settings);

      // Get active tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      });

      // Check whether a valid website is open
      if (!tab || !tab.id || !/^https?:/.test(tab.url || "")) {
        alert("Please open a normal website first.");
        return;
      }

      // Send settings to content.js
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: "APPLY_SETTINGS",
        settings: settings
      });

      // Check response
      if (response && response.success) {
        alert("CalmUI preferences applied!");
      } else {
        alert(
          "CalmUI could not apply preferences. Please check the console."
        );
      }

    } catch (error) {
      console.error("CalmUI Error:", error);

      alert("Error: " + error.message);
    }
  }
);

// Reset Preferences button
document.getElementById("resetButton").addEventListener(
  "click",
  async () => {

    try {
      // Reset saved preferences
      await chrome.storage.sync.set(defaults);

      // Uncheck all options
      settingIds.forEach(id => {
        document.getElementById(id).checked = false;
      });

      // Get active tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      });

      if (tab?.id && /^https?:/.test(tab.url || "")) {

        try {
          // Send default settings to content.js
          const response = await chrome.tabs.sendMessage(tab.id, {
            type: "APPLY_SETTINGS",
            settings: defaults
          });

          if (response && response.success) {
            alert("CalmUI preferences reset successfully!");
          } else {
            alert("Preferences reset in storage. Refresh the website.");
          }

        } catch (error) {
          console.error("Reset communication error:", error);
          alert("Preferences reset. Refresh the website to apply changes.");
        }

      } else {
        alert("Preferences reset successfully!");
      }

    } catch (error) {
      console.error("Reset Error:", error);
      alert("Could not reset preferences: " + error.message);
    }
  }
);

// Initialize popup
loadSettings();
