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
  "deep-dive": {
    title: "重点难点详解",
    file: "content/deep-dive.md",
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
let currentAnchor = "";
const defaultDoc = document.body.dataset.defaultDoc || "quick";
const docScope = (document.body.dataset.docScope || "")
  .split(/\s+/)
  .filter(Boolean);

const isDocAllowed = (docId) => !docScope.length || docScope.includes(docId);

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

const isSafeHref = (href) =>
  href.startsWith("#") || href.startsWith("?") || /^https?:\/\//i.test(href);

const renderInline = (value) => {
  let html = escapeHtml(value);

  html = html.replace(/\[([^\]]+?)\]\(([^)\s]+?)\)/g, (match, label, href) => {
    const cleanHref = href.trim();
    if (!isSafeHref(cleanHref)) return match;
    return `<a href="${cleanHref}">${label}</a>`;
  });

  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/`([^`]+?)`/g, "<code>$1</code>");
  return html;
};

const parseHeading = (rawText) => {
  const explicitId = rawText.match(/\s*\{#([A-Za-z0-9_-]+)\}\s*$/);
  if (explicitId) {
    return {
      id: explicitId[1],
      text: rawText.replace(/\s*\{#[A-Za-z0-9_-]+\}\s*$/, "").trim(),
    };
  }

  return { id: "", text: rawText };
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
      const parsed = parseHeading(heading[2]);
      const idAttribute = parsed.id ? ` id="${parsed.id}"` : "";
      html += `<h${level}${idAttribute}>${renderInline(parsed.text)}</h${level}>`;
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

const setUrlDoc = (docId, anchor = "") => {
  const url = new URL(window.location.href);
  url.searchParams.set("doc", docId);

  if (anchor) {
    url.searchParams.set("anchor", anchor);
  } else {
    url.searchParams.delete("anchor");
  }

  url.hash = "reader";
  window.history.replaceState({}, "", url);
};

const scrollToReader = (anchor = "") => {
  window.requestAnimationFrame(() => {
    const target = anchor ? document.getElementById(anchor) : null;
    const fallback = document.getElementById("reader");
    (target || fallback)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
};

const openDocument = async (docId, options = {}) => {
  const canOpenRequestedDoc = documents[docId] && isDocAllowed(docId);
  const requestedDoc = canOpenRequestedDoc ? docId : defaultDoc;
  const doc = documents[requestedDoc] || documents.quick;
  currentDoc = documents[requestedDoc] ? requestedDoc : "quick";
  currentAnchor = canOpenRequestedDoc ? options.anchor || "" : "";
  setActiveButton(currentDoc);

  if (readerTitle) readerTitle.textContent = doc.title;
  if (readerContent) readerContent.innerHTML = "<p>正在加载复习资料...</p>";

  try {
    const response = await fetch(doc.file);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const markdown = await response.text();
    if (readerContent) readerContent.innerHTML = renderMarkdown(markdown);
  } catch {
    currentAnchor = "";
    if (readerContent) {
      readerContent.innerHTML =
        "<p>这份资料暂时没有加载成功。请刷新页面，或检查网络连接后再试。</p>";
    }
  }

  setUrlDoc(currentDoc, currentAnchor);

  if (options.scroll || currentAnchor) {
    scrollToReader(currentAnchor);
  }
};

document.querySelectorAll("[data-open-doc]").forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    openDocument(trigger.dataset.openDoc, { scroll: true });
  });
});

readerContent?.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;

  const url = new URL(link.href, window.location.href);
  const samePage =
    url.origin === window.location.origin && url.pathname === window.location.pathname;
  const docId = url.searchParams.get("doc");

  if (!samePage || !docId || !documents[docId] || !isDocAllowed(docId)) return;

  event.preventDefault();
  openDocument(docId, {
    scroll: true,
    anchor: url.searchParams.get("anchor") || "",
  });
});

copyLinkButton?.addEventListener("click", async () => {
  const url = new URL(window.location.href);
  url.searchParams.set("doc", currentDoc);

  if (currentAnchor) {
    url.searchParams.set("anchor", currentAnchor);
  } else {
    url.searchParams.delete("anchor");
  }

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

const initialParams = new URLSearchParams(window.location.search);
const initialDoc = initialParams.get("doc") || defaultDoc;
const initialAnchor = initialParams.get("anchor") || "";

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });
openDocument(initialDoc, {
  anchor: initialAnchor,
  scroll: window.location.hash === "#reader" || Boolean(initialAnchor),
});
