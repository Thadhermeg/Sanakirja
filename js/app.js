

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

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("token")) {
    const id = e.target.dataset.id;
    const token = currentTokens.find(t => t.id == id);
    openSidebar(token);
  }
});

function openSidebar(token) {
  sidebar.innerHTML = `
    <h2>${token.form}</h2>
    <p><strong>Lemma:</strong> ${token.lemma}</p>
    <p><strong>POS:</strong> ${token.pos}</p>
    <p><strong>Morphology:</strong></p>
    <pre>${JSON.stringify(token.morph, null, 2)}</pre>
    <a href="lemma.html?lemma=${token.lemma}">
      View dictionary entry
    </a>
  `;
}

const texts = [
  { title: "Iƶoran keelen grammatikka (1936)", file: "data/GT.json" }
];

const menu = document.getElementById("textMenu");

texts.forEach(t => {
  const li = document.createElement("li");
  li.textContent = t.title;
  li.onclick = () => loadText(t);
  menu.appendChild(li);
});
