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
