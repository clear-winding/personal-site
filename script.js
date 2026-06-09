const header = document.querySelector("[data-header]");
const readerTitle = document.querySelector("[data-doc-title]");
const readerContent = document.querySelector("[data-reader-content]");
const copyLinkButton = document.querySelector("[data-copy-link]");

const documents = {
  guide: {
    title: "复习整理说明",
    file: "content/guide.md",
  },
  quick: {
    title: "期末速查",
    file: "content/quick.md",
  },
  "compile-notes": {
    title: "Compile 完整讲解",
    file: "content/compile-notes.md",
  },
  "compile-questions": {
    title: "Compile 期末题目",
    file: "content/compile-questions.md",
  },
  "network-notes": {
    title: "Network 完整讲解",
    file: "content/network-notes.md",
  },
  "network-questions": {
    title: "Network 期末题目",
    file: "content/network-questions.md",
  },
  "riscv-notes": {
    title: "RISC-V 完整讲解",
    file: "content/riscv-notes.md",
  },
  "riscv-questions": {
    title: "RISC-V 期末题目",
    file: "content/riscv-questions.md",
  },
};

let currentDoc = "quick";

const updateHeader = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const renderInline = (value) => {
  let html = escapeHtml(value);
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/`([^`]+?)`/g, "<code>$1</code>");
  return html;
};

const renderMarkdown = (markdown) => {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  let html = "";
  let paragraph = [];
  let listType = null;
  let code = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html += `<p>${renderInline(paragraph.join(" "))}</p>`;
    paragraph = [];
  };

  const closeList = () => {
    if (!listType) return;
    html += `</${listType}>`;
    listType = null;
  };

  const openList = (type) => {
    flushParagraph();
    if (listType === type) return;
    closeList();
    listType = type;
    html += `<${type}>`;
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (code) {
        html += `<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`;
        code = null;
      } else {
        flushParagraph();
        closeList();
        code = [];
      }
      continue;
    }

    if (code) {
      code.push(line);
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      closeList();
      continue;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      closeList();
      const level = heading[1].length;
      html += `<h${level}>${renderInline(heading[2])}</h${level}>`;
      continue;
    }

    const bullet = trimmed.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      openList("ul");
      html += `<li>${renderInline(bullet[1])}</li>`;
      continue;
    }

    const ordered = trimmed.match(/^\d+\.\s+(.+)$/);
    if (ordered) {
      openList("ol");
      html += `<li>${renderInline(ordered[1])}</li>`;
      continue;
    }

    paragraph.push(trimmed);
  }

  if (code) {
    html += `<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`;
  }
  flushParagraph();
  closeList();
  return html;
};

const setActiveButton = (docId) => {
  document.querySelectorAll("[data-open-doc]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.openDoc === docId);
  });
};

const setUrlDoc = (docId) => {
  const url = new URL(window.location.href);
  url.searchParams.set("doc", docId);
  url.hash = "reader";
  window.history.replaceState({}, "", url);
};

const openDocument = async (docId, options = {}) => {
  const doc = documents[docId] || documents.quick;
  currentDoc = documents[docId] ? docId : "quick";
  setActiveButton(currentDoc);

  if (readerTitle) readerTitle.textContent = doc.title;
  if (readerContent) readerContent.innerHTML = "<p>正在加载复习资料...</p>";

  try {
    const response = await fetch(doc.file);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const markdown = await response.text();
    if (readerContent) readerContent.innerHTML = renderMarkdown(markdown);
  } catch (error) {
    if (readerContent) {
      readerContent.innerHTML =
        "<p>这份资料暂时没有加载成功。请刷新页面，或检查网络连接后再试。</p>";
    }
  }

  setUrlDoc(currentDoc);

  if (options.scroll) {
    document.getElementById("reader")?.scrollIntoView({ behavior: "smooth" });
  }
};

document.querySelectorAll("[data-open-doc]").forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    openDocument(trigger.dataset.openDoc, { scroll: true });
  });
});

copyLinkButton?.addEventListener("click", async () => {
  const url = new URL(window.location.href);
  url.searchParams.set("doc", currentDoc);
  url.hash = "reader";

  try {
    await navigator.clipboard.writeText(url.toString());
    copyLinkButton.textContent = "已复制";
    window.setTimeout(() => {
      copyLinkButton.textContent = "复制当前链接";
    }, 1400);
  } catch {
    copyLinkButton.textContent = "复制失败";
    window.setTimeout(() => {
      copyLinkButton.textContent = "复制当前链接";
    }, 1400);
  }
});

const initialDoc = new URLSearchParams(window.location.search).get("doc") || "quick";
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });
openDocument(initialDoc, { scroll: window.location.hash === "#reader" });
