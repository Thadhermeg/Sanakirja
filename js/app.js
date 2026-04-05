// ===============================
// GLOBAL STATE
// ===============================

let currentText = null;

// ===============================
// TEXT LIST (LEFT SIDEBAR)
// ===============================

const texts = [
  { title: "Iƶoran keelen grammatikka (1936)", file: "data/GT.json" }
];

// DOM elements
const menu = document.getElementById("textMenu");
const textContainer = document.getElementById("text");
const textTitle = document.getElementById("textTitle");
const sidebar = document.getElementById("sidebar");

// ===============================
// INITIALIZE MENU
// ===============================

function initMenu() {
  texts.forEach(t => {
    const li = document.createElement("li");
    li.textContent = t.title;

    li.onclick = () => {
      loadText(t);
    };

    menu.appendChild(li);
  });
}

// ===============================
// LOAD TEXT
// ===============================

function loadText(textMeta) {
  console.log("Loading:", textMeta.file);

  fetch(textMeta.file)
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to load " + textMeta.file);
      }
      return res.json();
    })
    .then(data => {
      console.log("Loaded data:", data);

      currentText = data;

      if (!data.structure) {
        console.error("Missing 'structure' in JSON");
        textContainer.innerHTML = "<p>Error: Invalid text format</p>";
        return;
      }

      textTitle.textContent = data.title || "Untitled";

      renderStructuredText(data.structure);

      // Reset sidebar
      sidebar.innerHTML = "<p>Select a word</p>";
    })
    .catch(err => {
      console.error(err);
      textContainer.innerHTML = "<p>Could not load text.</p>";
    });
}

// ===============================
// RENDER TEXT (WITH STRUCTURE)
// ===============================

function renderStructuredText(structure) {
  textContainer.innerHTML = "";

  structure.forEach(block => {
    if (block.type === "paragraph") {
      const p = document.createElement("p");

      block.tokens.forEach(token => {

        // Handle punctuation
        if (token.punct) {
          p.innerHTML += token.form;
          return;
        }

        // Create clickable token
        const span = document.createElement("span");
        span.className = "token";
        span.textContent = token.form;

        span.onclick = () => {
          openSidebar(token);
        };

        p.appendChild(span);

        // Add space after word
        p.appendChild(document.createTextNode(" "));
      });

      textContainer.appendChild(p);
    }
  });
}

// ===============================
// SIDEBAR (MORPHOLOGY VIEW)
// ===============================

function openSidebar(token) {
  console.log("Opening sidebar for:", token);

  const morphLabels = {
    pos: "Part of Speech",
    tense: "Tense",
    number: "Number",
    aspect: "Aspect",
    case: "Case"
  };

  // Safe defaults
  const form = token.form || "(unknown)";
  const lemma = token.lemma || "(no lemma)";
  const pos = token.pos || "(unknown)";
  const morph = token.morph || {};

  // Build morphology tags
  let morphHTML = "";

  if (Object.keys(morph).length === 0) {
    morphHTML = "<p><em>No morphological information available.</em></p>";
  } else {
    for (let key in morph) {
      morphHTML += `
        <span class="tag ${key}">
          ${morphLabels[key] || key}: ${morph[key]}
        </span>
      `;
    }
  }

  // Always render base info FIRST
  sidebar.innerHTML = `
    <h2>${form}</h2>

    <p><strong>Lemma:</strong> ${lemma}</p>

    <div>
      <span class="tag pos">
        Part of Speech: ${pos}
      </span>
    </div>

    <h3>Morphology</h3>
    ${morphHTML}

    <div id="inflection">
      <p><em>Loading inflection…</em></p>
    </div>

    <p>
      <a href="lemma.html?lemma=${encodeURIComponent(lemma)}">
        View dictionary entry
      </a>
    </p>
  `;

  // Load inflection AFTER rendering (non-blocking)
  loadInflection(token);
}

// ===============================
// INFLECTION TABLE
// ===============================

function loadInflection(token) {
  const container = document.getElementById("inflection");

  fetch("data/dictionary.json")
    .then(res => {
      if (!res.ok) {
        throw new Error("Dictionary file not found");
      }
      return res.json();
    })
    .then(dict => {
      const entry = dict[token.lemma];

      // No dictionary entry at all
      if (!entry) {
        container.innerHTML = `
          <p><em>No dictionary entry found for "${token.lemma}".</em></p>
        `;
        return;
      }

      // No inflection data
      if (!entry.inflection || !entry.inflection.forms) {
        container.innerHTML = `
          <p><em>No inflection data available.</em></p>
        `;
        return;
      }

      const forms = entry.inflection.forms;

      let table = "<table><tr>";

      // Header
      for (let key in forms) {
        table += `<th>${key}</th>`;
      }

      table += "</tr><tr>";

      // Values
      for (let key in forms) {
        const form = forms[key];

        // Normalize comparison (important for diacritics!)
        const isMatch =
          form.normalize("NFC") === token.form.normalize("NFC");

        const highlight = isMatch ? "highlight" : "";

        table += `<td class="${highlight}">${form}</td>`;
      }

      table += "</tr></table>";

      container.innerHTML = `
        <h3>Inflection</h3>
        ${table}
      `;
    })
    .catch(err => {
      console.error("Inflection error:", err);

      container.innerHTML = `
        <p><em>Could not load inflection data.</em></p>
      `;
    });
}

// ===============================
// INIT APP
// ===============================

initMenu();

// Load first text automatically
if (texts.length > 0) {
  loadText(texts[0]);
}
