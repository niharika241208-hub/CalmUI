


/* =========================================
   CALMUI - CONTENT SCRIPT
   Accessibility Features + Clear Language
========================================= */


/* =========================================
   PART 1: DEFAULT SETTINGS
========================================= */

const defaultSettings = {
  largeText: false,
  spacing: false,
  motion: false,
  simple: false,
  language: false
};


/* =========================================
   PART 2: APPLY ACCESSIBILITY SETTINGS
========================================= */

function applyCalmUI(settings) {

  const root = document.documentElement;

  // Remove previously applied classes
  root.classList.remove(
    "calmui-large-text",
    "calmui-extra-spacing",
    "calmui-reduce-motion",
    "calmui-simple-layout"
  );

  // Apply Large Text
  if (settings.largeText) {
    root.classList.add("calmui-large-text");
  }

  // Apply Increased Spacing
  if (settings.spacing) {
    root.classList.add("calmui-extra-spacing");
  }

  // Apply Reduce Motion
  if (settings.motion) {
    root.classList.add("calmui-reduce-motion");
  }

  // Apply Simplified Layout
  if (settings.simple) {
    root.classList.add("calmui-simple-layout");
  }

  console.log("CalmUI preferences applied:", settings);
}


/* =========================================
   PART 3: RECEIVE SETTINGS FROM POPUP
========================================= */

chrome.runtime.onMessage.addListener(
  function (message, sender, sendResponse) {

    if (message.type === "APPLY_SETTINGS") {

      try {

        applyCalmUI(message.settings);

        sendResponse({
          success: true
        });

      } catch (error) {

        console.error("CalmUI error:", error);

        sendResponse({
          success: false,
          error: error.message
        });

      }

    }

    return false;
  }
);


/* =========================================
   PART 4: LOAD SAVED SETTINGS
========================================= */

chrome.storage.sync.get(
  defaultSettings,
  function (settings) {
    applyCalmUI(settings);
  }
);


/* =========================================
   PART 5: LISTEN FOR SETTING CHANGES
========================================= */

chrome.storage.onChanged.addListener(
  function (changes, area) {

    if (area !== "sync") {
      return;
    }

    chrome.storage.sync.get(
      defaultSettings,
      function (settings) {
        applyCalmUI(settings);
      }
    );

  }
);


/* =========================================
   PART 6: CLEAR LANGUAGE FRONTEND
========================================= */

(function () {

  // Prevent duplicate widgets
  if (document.getElementById("calmui-language-widget")) {
    return;
  }

  let selectedText = "";

  // Create the main widget
  const widget = document.createElement("div");

  widget.id = "calmui-language-widget";

  document.body.appendChild(widget);

  // Create Shadow DOM to prevent website CSS conflicts
  const shadow = widget.attachShadow({
    mode: "open"
  });

  shadow.innerHTML = `

    <style>

      * {
        box-sizing: border-box;
        font-family: Arial, sans-serif;
      }

      /* SIMPLIFY BUTTON */

      #simplifyButton {
        display: none;
        position: fixed;
        z-index: 999999;

        padding: 10px 16px;

        border: none;
        border-radius: 9px;

        background: #48c77b;
        color: #103323;

        font-size: 13px;
        font-weight: bold;

        cursor: pointer;

        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        pointer-events: auto;
      }

      #simplifyButton:hover {
        background: #8de8a8;
      }

      /* RESULT PANEL */

      #resultPanel {
        display: none;

        position: fixed;
        right: 20px;
        bottom: 20px;

        width: 330px;
        max-width: calc(100vw - 30px);
        max-height: 80vh;

        overflow-y: auto;

        z-index: 999999;

        padding: 18px;

        border-radius: 16px;

        background: #15372b;
        color: white;

        border: 1px solid #426b52;

        box-shadow: 0 10px 35px rgba(0,0,0,0.3);

        pointer-events: auto;
      }

      /* PANEL HEADER */

      .panelHeader {
        display: flex;
        justify-content: space-between;
        align-items: center;

        margin-bottom: 15px;
      }

      .panelHeader h2 {
        margin: 0;
        font-size: 19px;
        color: #a9edbd;
      }

      #closePanel {
        border: none;
        background: transparent;
        color: white;
        font-size: 22px;
        cursor: pointer;
      }

      /* TEXT SECTIONS */

      .sectionTitle {
        font-size: 12px;
        color: #a9edbd;
        font-weight: bold;
        margin-bottom: 7px;
      }

      .textBox {
        padding: 12px;

        background: rgba(255,255,255,0.09);

        border-radius: 9px;

        font-size: 13px;
        line-height: 1.6;

        overflow-wrap: anywhere;

        margin-bottom: 15px;
      }

      .resultBox {
        min-height: 65px;
        padding: 12px;

        background: rgba(141,232,168,0.1);

        border: 1px solid rgba(141,232,168,0.25);

        border-radius: 9px;

        color: #d7f5df;

        font-size: 13px;
        line-height: 1.6;

        overflow-wrap: anywhere;
      }

      .statusMessage {
        margin-top: 13px;

        color: #b4c9ba;

        font-size: 11px;
        line-height: 1.5;
      }

      /* SMALL SCREEN SUPPORT */

      @media (max-width: 400px) {

        #resultPanel {
          right: 10px;
          bottom: 10px;

          width: calc(100vw - 20px);
        }

      }

    </style>


    <!-- FLOATING SIMPLIFY BUTTON -->

    <button id="simplifyButton">
      ✨ Simplify
    </button>


    <!-- CLEAR LANGUAGE RESULT PANEL -->

    <div
      id="resultPanel"
      role="dialog"
      aria-label="Clear Language"
    >

      <div class="panelHeader">

        <h2>✨ Clear Language</h2>

        <button
          id="closePanel"
          aria-label="Close"
        >
          ×
        </button>

      </div>


      <div class="sectionTitle">
        ORIGINAL TEXT
      </div>

      <div
        class="textBox"
        id="originalText"
      ></div>


      <div class="sectionTitle">
        SIMPLIFIED TEXT
      </div>

      <div
        class="resultBox"
        id="simplifiedText"
      >
        Your simpler version will appear here.
      </div>


      <div class="statusMessage">
        AI simplification will be available after backend integration.
      </div>

    </div>

  `;


  /* =========================================
     PART 7: GET INTERFACE ELEMENTS
  ========================================= */

  const simplifyButton =
    shadow.getElementById("simplifyButton");

  const resultPanel =
    shadow.getElementById("resultPanel");

  const closeButton =
    shadow.getElementById("closePanel");

  const originalTextBox =
    shadow.getElementById("originalText");


  /* =========================================
     PART 8: DETECT SELECTED TEXT
  ========================================= */

  document.addEventListener("mouseup", function () {

    setTimeout(function () {

      const selection = window.getSelection();

      const text = selection
        ? selection.toString().trim()
        : "";

      // Hide button if no useful text is selected
      if (!text || text.length < 3 || selection.rangeCount === 0) {

        simplifyButton.style.display = "none";

        return;
      }

      selectedText = text;

      const range = selection.getRangeAt(0);

      const rect = range.getBoundingClientRect();

      simplifyButton.style.display = "block";

      // Position the button near selected text
      const buttonWidth = 110;

      const left = Math.max(
        8,
        Math.min(
          rect.left,
          window.innerWidth - buttonWidth - 8
        )
      );

      const top = Math.max(
        8,
        Math.min(
          rect.bottom + 8,
          window.innerHeight - 45
        )
      );

      simplifyButton.style.left = left + "px";

      simplifyButton.style.top = top + "px";

    }, 50);

  });


  /* =========================================
     PART 9: OPEN CLEAR LANGUAGE PANEL
  ========================================= */

  simplifyButton.addEventListener("click", function () {

    if (!selectedText) {
      return;
    }

    // Display the selected original text
    originalTextBox.textContent = selectedText;

    // Show result panel
    resultPanel.style.display = "block";

    simplifyButton.style.display = "none";

  });


  /* =========================================
     PART 10: CLOSE RESULT PANEL
  ========================================= */

  closeButton.addEventListener("click", function () {

    resultPanel.style.display = "none";

  });


  /* =========================================
     PART 11: HIDE BUTTON WHEN SCROLLING
  ========================================= */

  document.addEventListener(
    "scroll",
    function () {

      simplifyButton.style.display = "none";

    },
    true
  );


  console.log("CalmUI Clear Language interface loaded.");

})();
