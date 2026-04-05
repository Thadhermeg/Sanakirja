let currentTokens = [];

const textContainer = document.getElementById("text");
const sidebar = document.getElementById("sidebar");
const selector = document.getElementById("textSelector");

// Load default text
loadText(selector.value);

selector.addEventListener("change", () => {
  loadText(selector.value);
});

function loadText(path) {
  fetch(path)
    .then(res => res.json())
    .then(data => {
      currentTokens = data.tokens;
      renderText();
    });
}

function renderText() {
  textContainer.innerHTML = currentTokens.map(token =>
    `<span class="token" data-id="${token.id}">
      ${token.form}
    </span>`
  ).join(" ");
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