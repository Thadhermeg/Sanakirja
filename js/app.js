let currentTokens = [];

function loadText(textMeta) {
  fetch(textMeta.file)
    .then(res => res.json())
    .then(data => {
      document.getElementById("textTitle").textContent = data.title;
      renderStructuredText(data.structure);
    });
}

function renderStructuredText(structure) {
  const container = document.getElementById("text");
  container.innerHTML = "";

  structure.forEach(block => {
    const p = document.createElement("p");

    block.tokens.forEach((token, i) => {
      if (token.punct) {
        p.innerHTML += token.form;
        return;
      }

      const span = document.createElement("span");
      span.className = "token";
      span.textContent = token.form;
      span.onclick = () => openSidebar(token);

      p.appendChild(span);
      p.innerHTML += " ";
    });

    container.appendChild(p);
  });
}

const texts = [
  { title: "Text 1", file: "data/text1.json" }
];

const menu = document.getElementById("textMenu");

texts.forEach(t => {
  const li = document.createElement("li");
  li.textContent = t.title;
  li.onclick = () => loadText(t);
  menu.appendChild(li);
});

function openSidebar(token) {
  const sidebar = document.getElementById("sidebar");

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

function loadInflection(token) {
  fetch("data/dictionary.json")
    .then(res => res.json())
    .then(dict => {
      const entry = dict[token.lemma];
      if (!entry || !entry.inflection) return;

      const forms = entry.inflection.forms;

      let table = "<table><tr>";

      for (let key in forms) {
        table += `<th>${key}</th>`;
      }

      table += "</tr><tr>";

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
    });
}
