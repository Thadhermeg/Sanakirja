// ===============================
// GLOBAL STATE
// ===============================

let currentText = null;

// ===============================
// TEXT LIST (LEFT SIDEBAR)
// ===============================

const texts = [
  { title: "Text 1", file: "data/text1.json" }
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
  fetch(textMeta.file)
    .then(res => {
      console.log("Status:", res.status);

      if (!res.ok) {
        throw new Error("HTTP error: " + res.status);
      }

      return res.json();
    })
    .then(data => {
      console.log("SUCCESS:", data);
      renderStructuredText(data.structure);
    })
    .catch(err => {
      console.error("ERROR:", err);
      alert("Check console (F12)");
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
  const morphLabels = {
    pos: "Part of Speech",
    tense: "Tense",
    number: "Number",
    aspect: "Aspect"
  };

  let morphHTML = "";

  if (token.morph) {
    for (let key in token.morph) {
      morphHTML += `
        <span class="tag ${key}">
          ${morphLabels[key] || key}: ${token.morph[key]}
        </span>
      `;
    }
  }

  sidebar.innerHTML = `
    <h2>${token.form}</h2>

    <p><strong>Lemma:</strong> ${token.lemma}</p>

    <div>
      <span class="tag pos">
        Part of Speech: ${token.pos}
      </span>
    </div>

    <h3>Morphology</h3>
    ${morphHTML}

    <div id="inflection"></div>

    <p>
      <a href="lemma.html?lemma=${token.lemma}">
        View dictionary entry
      </a>
    </p>
  `;

  loadInflection(token);
}

// ===============================
// INFLECTION TABLE
// ===============================

function loadInflection(token) {
  fetch("data/dictionary.json")
    .then(res => res.json())
    .then(dict => {
      const entry = dict[token.lemma];

      if (!entry || !entry.inflection) {
        return;
      }

      const forms = entry.inflection.forms;

      let table = "<table><tr>";

      // Header row
      for (let key in forms) {
        table += `<th>${key}</th>`;
      }

      table += "</tr><tr>";

      // Values row
      for (let key in forms) {
        const form = forms[key];
        const highlight = form === token.form ? "highlight" : "";
        table += `<td class="${highlight}">${form}</td>`;
      }

      table += "</tr></table>";

      document.getElementById("inflection").innerHTML = `
        <h3>Inflection</h3>
        ${table}
      `;
    })
    .catch(err => console.error("Dictionary load error:", err));
}

// ===============================
// INIT APP
// ===============================

initMenu();

// Load first text automatically
if (texts.length > 0) {
  loadText(texts[0]);
}
