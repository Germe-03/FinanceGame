export function renderMarkdown(md) {
  const lines = md.split("\n");
  const output = [];
  let listItems = [];

  function flushList() {
    if (listItems.length > 0) {
      output.push(`<ul>${listItems.map((t) => `<li>${t}</li>`).join("")}</ul>`);
      listItems = [];
    }
  }

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith("### ")) {
      flushList();
      output.push(`<h3>${inline(line.slice(4))}</h3>`);
    } else if (line.startsWith("## ")) {
      flushList();
      output.push(`<h2>${inline(line.slice(3))}</h2>`);
    } else if (line.startsWith("# ")) {
      flushList();
      output.push(`<h1>${inline(line.slice(2))}</h1>`);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      listItems.push(inline(line.slice(2)));
    } else if (line === "---") {
      flushList();
      output.push("<hr>");
    } else if (line.trim() === "") {
      flushList();
    } else {
      flushList();
      output.push(`<p>${inline(line)}</p>`);
    }
  }

  flushList();
  return output.join("\n");
}

function inline(text) {
  // Extract images first (src must not be HTML-escaped)
  const images = [];
  const withPlaceholders = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
    images.push({ alt, src });
    return `\x00${images.length - 1}\x00`;
  });

  // Escape HTML, then apply markdown, then restore images
  return withPlaceholders
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\x00(\d+)\x00/g, (_, i) => {
      const { alt, src } = images[Number(i)];
      return `<img src="${src}" alt="${alt}" class="md-image">`;
    });
}
