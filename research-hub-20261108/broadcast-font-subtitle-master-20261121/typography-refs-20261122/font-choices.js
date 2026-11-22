function renderFontChoices(container, names, selected, onSelect) {
  const buttons = names.map((name, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn";
    button.textContent = name;
    button.onclick = () => {
      markSelected(index);
      onSelect(index);
    };
    return button;
  });
  function markSelected(index) {
    buttons.forEach((button, i) => {
      button.classList.toggle("btn-primary", i === index);
      button.setAttribute("aria-pressed", String(i === index));
    });
  }
  markSelected(selected);
  container.replaceChildren(...buttons);
  return buttons;
}
