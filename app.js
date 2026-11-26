(function () {
  "use strict";

  var ITEMS_KEY = "playerok.templates.v2";
  var LEGACY_KEY = "playerok.templates.v1";
  var SETTINGS_KEY = "playerok.settings.v1";
  var BG_KEY = "bg-image";

  var THEMES = [
    { id: "night", name: "Ночь", dot: "#3ddc97", swatch: "linear-gradient(135deg,#0a0f16,#1b2836)" },
    { id: "ocean", name: "Океан", dot: "#4cc9f0", swatch: "linear-gradient(135deg,#061620,#12374a)" },
    { id: "violet", name: "Аметист", dot: "#a78bfa", swatch: "linear-gradient(135deg,#0d0918,#2a1e42)" },
    { id: "sunset", name: "Закат", dot: "#ff8f6b", swatch: "linear-gradient(135deg,#150c0f,#3a1f24)" },
    { id: "light", name: "Светлая", dot: "#0f9d68", swatch: "linear-gradient(135deg,#f7f9fc,#dfe6f0)" }
  ];

  var ACCENTS = [
    { id: "mint", name: "Мята", color: "#3ddc97", rgb: "61, 220, 151", ink: "#04231a" },
    { id: "sky", name: "Небо", color: "#4cc9f0", rgb: "76, 201, 240", ink: "#04222c" },
    { id: "violet", name: "Аметист", color: "#a78bfa", rgb: "167, 139, 250", ink: "#1a1033" },
    { id: "amber", name: "Янтарь", color: "#f7b955", rgb: "247, 185, 85", ink: "#2b1d02" },
    { id: "rose", name: "Роза", color: "#ff7a90", rgb: "255, 122, 144", ink: "#2e0a12" }
  ];

  var BACKGROUNDS = [
    { id: "none", name: "Без фото", css: "" },
    { id: "aurora", name: "Аврора", css: "linear-gradient(140deg,#08131c,#0e3f3a 45%,#0b2a3d)" },
    { id: "mono", name: "Ч/б", css: "linear-gradient(140deg,#0a0a0b,#4b4b50 50%,#101012)" },
    { id: "ember", name: "Угли", css: "linear-gradient(140deg,#180a0f,#3d1717 52%,#1c0f22)" },
    { id: "deep", name: "Глубина", css: "linear-gradient(140deg,#03101d,#0a3a55 48%,#061f2d)" },
    { id: "forest", name: "Чаща", css: "linear-gradient(140deg,#06130f,#12402e 55%,#091d17)" },
    { id: "dusk", name: "Сумерки", css: "linear-gradient(140deg,#0b0920,#2b1c4d 50%,#140c29)" },
    { id: "steel", name: "Сталь", css: "linear-gradient(140deg,#0a1017,#2e3f4d 52%,#0b131a)" },
    { id: "plum", name: "Слива", css: "linear-gradient(140deg,#130a19,#452350 50%,#170d1e)" },
    { id: "sand", name: "Песок", css: "linear-gradient(140deg,#151009,#40311a 55%,#171008)" },
    { id: "ice", name: "Лёд", css: "linear-gradient(140deg,#07121c,#20455f 52%,#07131d)" },
    { id: "graphite", name: "Графит", color: "#14161a" },
    { id: "midnight", name: "Полночь", color: "#0b1220" },
    { id: "pine", name: "Хвоя", color: "#0c1a14" },
    { id: "wine", name: "Вино", color: "#1a1026" },
    { id: "coffee", name: "Кофе", color: "#17110c" }
  ];

  var DEFAULTS = {
    theme: "night",
    accent: "mint",
    customAccent: "#3ddc97",
    bgPreset: "aurora",
    bgColor: "#0b1220",
    bgDim: 68,
    bgBlur: 8,
    animations: true,
    sort: "new"
  };

  var items = [];
  var settings = Object.assign({}, DEFAULTS);
  var customBg = null;
  var editingId = null;
  var detailId = null;
  var query = "";
  var openStack = [];
  var launchedTile = null;
  var toastTimer = null;
  var dbPromise = null;
  var storageOk = true;

  var grid = document.getElementById("grid");
  var emptyState = document.getElementById("emptyState");
  var emptyTitle = document.getElementById("emptyTitle");
  var emptyText = document.getElementById("emptyText");
  var countBadge = document.getElementById("countBadge");
  var contentSub = document.getElementById("contentSub");
  var searchInput = document.getElementById("search");
  var sortBar = document.getElementById("sortBar");
  var toastEl = document.getElementById("toast");
  var storageDot = document.getElementById("storageDot");
  var storageText = document.getElementById("storageText");
  var importFile = document.getElementById("importFile");
  var backdropPhoto = document.getElementById("backdropPhoto");
  var backdropEl = document.querySelector(".backdrop");

  var detailOverlay = document.getElementById("detailOverlay");
  var detailTitle = document.getElementById("detailTitle");
  var detailMeta = document.getElementById("detailMeta");
  var detailBody = document.getElementById("detailBody");

  var editorOverlay = document.getElementById("editorOverlay");
  var editorTitle = document.getElementById("editorTitle");
  var form = document.getElementById("itemForm");
  var fTitle = document.getElementById("fTitle");
  var fDescription = document.getElementById("fDescription");
  var fComment = document.getElementById("fComment");
  var saveBtn = document.getElementById("saveBtn");
  var formError = document.getElementById("formError");
  var cTitle = document.getElementById("cTitle");
  var cDescription = document.getElementById("cDescription");
  var cComment = document.getElementById("cComment");

  var settingsOverlay = document.getElementById("settingsOverlay");
  var themeRow = document.getElementById("themeRow");
  var accentRow = document.getElementById("accentRow");
  var bgRow = document.getElementById("bgRow");
  var bgFile = document.getElementById("bgFile");
  var bgColorPicker = document.getElementById("bgColorPicker");
  var bgColorHex = document.getElementById("bgColorHex");
  var bgDimInput = document.getElementById("bgDim");
  var bgBlurInput = document.getElementById("bgBlur");
  var bgDimVal = document.getElementById("bgDimVal");
  var bgBlurVal = document.getElementById("bgBlurVal");
  var animToggle = document.getElementById("animToggle");
  var accentPicker = document.getElementById("accentPicker");
  var accentHex = document.getElementById("accentHex");
  var accentRgb = document.getElementById("accentRgb");

  function uid() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9);
  }

  function svg(paths, strokeWidth) {
    var ns = "http://www.w3.org/2000/svg";
    var node = document.createElementNS(ns, "svg");
    node.setAttribute("viewBox", "0 0 24 24");
    node.setAttribute("fill", "none");
    node.setAttribute("stroke", "currentColor");
    node.setAttribute("stroke-width", strokeWidth || "2");
    node.setAttribute("stroke-linecap", "round");
    node.setAttribute("stroke-linejoin", "round");
    node.setAttribute("aria-hidden", "true");
    paths.forEach(function (d) {
      var p = document.createElementNS(ns, "path");
      p.setAttribute("d", d);
      node.appendChild(p);
    });
    return node;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function showToast(message, isError) {
    toastEl.textContent = message;
    toastEl.classList.toggle("is-error", Boolean(isError));
    toastEl.classList.add("is-visible");
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2400);
  }

  function setStorageState(ok) {
    storageOk = ok;
    storageDot.classList.toggle("is-error", !ok);
    storageText.textContent = ok
      ? "Всё хранится локально на этом компьютере"
      : "Не удалось записать данные на диск — сделайте экспорт";
  }

  function loadItems() {
    try {
      var raw = window.localStorage.getItem(ITEMS_KEY) || window.localStorage.getItem(LEGACY_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(function (item) {
        return item && typeof item === "object";
      }).map(function (item) {
        return {
          id: typeof item.id === "string" ? item.id : uid(),
          title: typeof item.title === "string" ? item.title : "",
          description: typeof item.description === "string" ? item.description : "",
          comment: typeof item.comment === "string" ? item.comment : "",
          createdAt: Number(item.createdAt) || Date.now(),
          updatedAt: Number(item.updatedAt) || Number(item.createdAt) || Date.now()
        };
      });
    } catch (err) {
      setStorageState(false);
      return [];
    }
  }

  function loadSettings() {
    try {
      var raw = window.localStorage.getItem(SETTINGS_KEY);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return;
      Object.keys(DEFAULTS).forEach(function (key) {
        if (parsed[key] !== undefined && typeof parsed[key] === typeof DEFAULTS[key]) {
          settings[key] = parsed[key];
        }
      });
    } catch (err) {
      setStorageState(false);
    }
  }

  function persistItems() {
    try {
      window.localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
      setStorageState(true);
      return true;
    } catch (err) {
      setStorageState(false);
      showToast("Не удалось сохранить данные — сделайте экспорт", true);
      return false;
    }
  }

  function persistSettings() {
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      setStorageState(true);
    } catch (err) {
      setStorageState(false);
    }
  }

  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      if (!window.indexedDB) {
        reject(new Error("no idb"));
        return;
      }
      var request = window.indexedDB.open("playerok-assets", 1);
      request.onupgradeneeded = function () {
        var db = request.result;
        if (!db.objectStoreNames.contains("assets")) db.createObjectStore("assets");
      };
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { reject(request.error); };
    });
    return dbPromise;
  }

  function saveBg(dataUrl) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction("assets", "readwrite");
        tx.objectStore("assets").put(dataUrl, BG_KEY);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
      });
    }).catch(function () {
      try {
        window.localStorage.setItem("playerok.bg.v1", dataUrl);
        return;
      } catch (err) {
        throw err;
      }
    });
  }

  function readBg() {
    return openDb().then(function (db) {
      return new Promise(function (resolve) {
        var tx = db.transaction("assets", "readonly");
        var req = tx.objectStore("assets").get(BG_KEY);
        req.onsuccess = function () { resolve(req.result || null); };
        req.onerror = function () { resolve(null); };
      });
    }).catch(function () {
      try {
        return window.localStorage.getItem("playerok.bg.v1");
      } catch (err) {
        return null;
      }
    });
  }

  function dropBg() {
    try { window.localStorage.removeItem("playerok.bg.v1"); } catch (err) { }
    return openDb().then(function (db) {
      return new Promise(function (resolve) {
        var tx = db.transaction("assets", "readwrite");
        tx.objectStore("assets").delete(BG_KEY);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { resolve(); };
      });
    }).catch(function () { });
  }

  function clampByte(value) {
    var number = parseInt(value, 10);
    if (isNaN(number)) return null;
    return Math.min(255, Math.max(0, number));
  }

  function parseColor(value) {
    if (!value) return null;
    var str = String(value).trim().toLowerCase();
    var match = str.match(/^#([0-9a-f]{3})$/);
    if (match) {
      var short = match[1];
      return {
        r: parseInt(short[0] + short[0], 16),
        g: parseInt(short[1] + short[1], 16),
        b: parseInt(short[2] + short[2], 16)
      };
    }
    match = str.match(/^#([0-9a-f]{6})$/);
    if (match) {
      return {
        r: parseInt(match[1].slice(0, 2), 16),
        g: parseInt(match[1].slice(2, 4), 16),
        b: parseInt(match[1].slice(4, 6), 16)
      };
    }
    match = str.match(/^rgba?\(\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})/);
    if (match) {
      var r = clampByte(match[1]);
      var g = clampByte(match[2]);
      var b = clampByte(match[3]);
      if (r === null || g === null || b === null) return null;
      return { r: r, g: g, b: b };
    }
    return null;
  }

  function toHex(rgb) {
    function part(value) {
      var hex = Math.min(255, Math.max(0, value)).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }
    return "#" + part(rgb.r) + part(rgb.g) + part(rgb.b);
  }

  function inkFor(rgb) {
    var luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
    return luminance > 0.62 ? "#08140f" : "#ffffff";
  }

  function currentAccent() {
    if (settings.accent === "custom") {
      var rgb = parseColor(settings.customAccent) || { r: 61, g: 220, b: 151 };
      return {
        id: "custom",
        color: toHex(rgb),
        rgb: rgb.r + ", " + rgb.g + ", " + rgb.b,
        ink: inkFor(rgb)
      };
    }
    return ACCENTS.find(function (entry) { return entry.id === settings.accent; }) || ACCENTS[0];
  }

  function applyTheme() {
    document.body.dataset.theme = settings.theme;
    var accent = currentAccent();
    var root = document.documentElement.style;
    root.setProperty("--accent", accent.color);
    root.setProperty("--accent-rgb", accent.rgb);
    root.setProperty("--accent-ink", accent.ink);
    document.body.dataset.anim = settings.animations ? "on" : "off";
  }

  function applyBackground() {
    var preset = BACKGROUNDS.find(function (entry) { return entry.id === settings.bgPreset; }) || BACKGROUNDS[0];
    var colorMode = settings.bgPreset === "color";
    var image = "none";
    var tone = "";

    if (customBg) {
      image = 'url("' + customBg + '")';
    } else if (colorMode) {
      tone = settings.bgColor;
    } else if (preset.color) {
      tone = preset.color;
    } else if (preset.css) {
      image = preset.css;
    }

    var toneRgb = tone ? parseColor(tone) : null;
    var toneLuminance = 0;
    if (toneRgb) {
      toneLuminance = (0.2126 * toneRgb.r + 0.7152 * toneRgb.g + 0.0722 * toneRgb.b) / 255;
    }
    var shade = settings.bgDim / 100;
    if (tone && toneLuminance <= 0.55) shade = 0;

    backdropPhoto.style.backgroundImage = image === "none" ? "none" : image;
    backdropPhoto.style.backgroundColor = tone || "transparent";
    backdropPhoto.classList.toggle("is-set", Boolean(customBg || tone || image !== "none"));
    backdropPhoto.classList.toggle("has-photo", Boolean(customBg));
    if (backdropEl) backdropEl.classList.toggle("is-solid", Boolean(tone));
    backdropPhoto.style.setProperty("--bg-dim", String(shade));
    backdropPhoto.style.setProperty("--bg-blur", (customBg ? settings.bgBlur : 0) + "px");
    document.documentElement.style.setProperty("--bg-image", image);
    document.documentElement.style.setProperty("--bg-dim", String(shade));
    document.documentElement.style.setProperty("--bg-blur", (customBg ? settings.bgBlur : 0) + "px");
  }

  function copyText(text) {
    if (!text) return Promise.resolve(false);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () {
        return true;
      }).catch(function () {
        return legacyCopy(text);
      });
    }
    return Promise.resolve(legacyCopy(text));
  }

  function legacyCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    var ok = false;
    try {
      area.select();
      ok = document.execCommand("copy");
    } catch (err) {
      ok = false;
    }
    document.body.removeChild(area);
    return ok;
  }

  function flashCopied(button, defaultLabel) {
    if (!button) return;
    if (!button.dataset.copyLabel) button.dataset.copyLabel = defaultLabel;
    var label = button.dataset.copyLabel;
    button.classList.add("is-copied");
    button.textContent = "Скопировано";
    window.setTimeout(function () {
      button.classList.remove("is-copied");
      button.textContent = label;
    }, 1500);
  }

  function copyAndReport(text, label, button) {
    copyText(text).then(function (ok) {
      if (ok) {
        showToast(label + " — в буфере обмена");
        flashCopied(button, label);
      } else {
        showToast("Не удалось скопировать — выделите текст вручную", true);
      }
    });
  }

  function copyButton(label, getText) {
    var btn = el("button", "btn btn-ghost btn-small copy-btn");
    btn.type = "button";
    btn.dataset.copyLabel = "Копировать";
    btn.appendChild(svg(["M9 9h10v10H9z", "M5 15V5h10"], "1.9"));
    btn.appendChild(document.createTextNode("Копировать"));
    btn.setAttribute("aria-label", "Скопировать: " + label);
    btn.addEventListener("click", function () {
      copyAndReport(getText(), label, btn);
    });
    return btn;
  }

  function formatDate(ts) {
    try {
      return new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "long",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(ts));
    } catch (err) {
      return "";
    }
  }

  function pluralize(count, forms) {
    var abs = Math.abs(count) % 100;
    var last = abs % 10;
    if (abs > 10 && abs < 20) return forms[2];
    if (last > 1 && last < 5) return forms[1];
    if (last === 1) return forms[0];
    return forms[2];
  }

  function visibleItems() {
    var needle = query.trim().toLowerCase();
    var list = items.filter(function (item) {
      if (!needle) return true;
      return (item.title + " " + item.description + " " + item.comment).toLowerCase().indexOf(needle) !== -1;
    });
    if (settings.sort === "old") {
      list = list.slice().sort(function (a, b) { return a.createdAt - b.createdAt; });
    } else if (settings.sort === "alpha") {
      list = list.slice().sort(function (a, b) {
        return a.title.localeCompare(b.title, "ru", { sensitivity: "base" });
      });
    } else {
      list = list.slice().sort(function (a, b) { return b.createdAt - a.createdAt; });
    }
    return list;
  }

  function render(options) {
    var animate = options && options.animate;
    var list = visibleItems();

    grid.textContent = "";
    countBadge.textContent = String(items.length);
    contentSub.textContent = items.length
      ? "Нажмите на плитку, чтобы открыть шаблон и скопировать текст."
      : "Создайте первый шаблон — он появится здесь плиткой.";

    if (!list.length) {
      emptyState.hidden = false;
      if (items.length === 0) {
        emptyTitle.textContent = "Пока пусто";
        emptyText.textContent = "Создайте первый шаблон: название, описание и комментарий будут под рукой и скопируются одним нажатием.";
        document.getElementById("emptyCreate").hidden = false;
      } else {
        emptyTitle.textContent = "Ничего не нашлось";
        emptyText.textContent = "Попробуйте другой запрос или очистите строку поиска.";
        document.getElementById("emptyCreate").hidden = true;
      }
    } else {
      emptyState.hidden = true;
    }

    list.forEach(function (item, index) {
      grid.appendChild(renderTile(item, index, animate));
    });
  }

  function renderTile(item, index, animate) {
    var shell = el("li", "tile-shell");
    var tile = el("button", "tile");
    tile.type = "button";
    if (animate) {
      tile.style.animationDelay = Math.min(index * 26, 260) + "ms";
    } else {
      tile.style.animation = "none";
    }
    tile.dataset.id = item.id;
    tile.setAttribute("aria-label", "Открыть шаблон: " + (item.title || "без названия"));

    tile.appendChild(el("span", "tile-num", String(index + 1).padStart(2, "0")));
    tile.appendChild(el("h3", "tile-title", item.title || "Без названия"));
    tile.appendChild(el("p", "tile-snippet", item.description || item.comment || "Нет текста"));

    var foot = el("div", "tile-foot");
    if (item.description) {
      var descChip = el("span", "chip");
      descChip.appendChild(svg(["M4 6h16M4 12h16M4 18h10"], "2.2"));
      descChip.appendChild(document.createTextNode(item.description.length + " " + pluralize(item.description.length, ["символ", "символа", "символов"])));
      foot.appendChild(descChip);
    }
    if (item.comment && item.comment.trim()) {
      var commentChip = el("span", "chip chip-comment");
      commentChip.appendChild(svg(["M21 12a8 8 0 0 1-8 8H8l-4 3V12a8 8 0 0 1 8-8h1a8 8 0 0 1 8 8Z"], "1.8"));
      commentChip.appendChild(document.createTextNode("комментарий"));
      foot.appendChild(commentChip);
    }
    tile.appendChild(foot);

    tile.addEventListener("click", function () {
      openDetail(item.id, tile);
    });

    shell.appendChild(tile);
    return shell;
  }

  function blockFor(label, value, copyLabel) {
    var wrap = el("div", "detail-block");
    var head = el("div", "detail-block-head");
    head.appendChild(el("span", "detail-label", label));
    if (value) head.appendChild(copyButton(copyLabel, function () { return value; }));
    wrap.appendChild(head);
    var text = el("p", "detail-text", value || "Не заполнено");
    if (!value) text.classList.add("is-empty");
    wrap.appendChild(text);
    return wrap;
  }

  function openDetail(id, originEl) {
    var item = items.find(function (entry) { return entry.id === id; });
    if (!item) return;
    detailId = id;
    detailTitle.textContent = item.title || "Без названия";
    var meta = "Создан " + formatDate(item.createdAt);
    if (item.updatedAt - item.createdAt > 60000) meta += " · изменён " + formatDate(item.updatedAt);
    detailMeta.textContent = meta;

    detailBody.textContent = "";
    detailBody.appendChild(blockFor("Название", item.title, "Название"));
    detailBody.appendChild(blockFor("Описание", item.description, "Описание"));
    detailBody.appendChild(blockFor("Комментарий", item.comment, "Комментарий"));

    showDetail(originEl);
  }

  function focusOverlay(overlay) {
    var focusTarget = overlay.querySelector("input:not([type=file]), textarea, button.btn-primary, button");
    if (focusTarget) focusTarget.focus({ preventScroll: true });
  }

  function morphEnabled() {
    if (!settings.animations) return false;
    return typeof Element !== "undefined" && typeof Element.prototype.animate === "function";
  }

  function showDetail(originEl) {
    var overlay = detailOverlay;
    var modal = overlay.querySelector(".modal");
    var origin = originEl && originEl.isConnected ? originEl : null;

    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    if (openStack.indexOf(overlay) === -1) openStack.push(overlay);
    launchedTile = origin;

    if (!origin || !morphEnabled()) {
      window.requestAnimationFrame(function () {
        overlay.classList.add("is-open");
        focusOverlay(overlay);
      });
      return;
    }

    overlay.classList.add("is-flip");
    void modal.offsetWidth;
    overlay.classList.add("is-open");
    origin.classList.add("is-launching");

    var target = modal.getBoundingClientRect();
    var from = origin.getBoundingClientRect();

    if (!target.width || !target.height) {
      overlay.classList.remove("is-flip");
      return;
    }

    var scaleX = from.width / target.width;
    var scaleY = from.height / target.height;
    var shiftX = from.left - target.left;
    var shiftY = from.top - target.top;

    modal.classList.add("is-morphing");

    var morph = modal.animate([
      {
        transformOrigin: "left top",
        transform: "translate(" + shiftX + "px, " + shiftY + "px) scale(" + scaleX + ", " + scaleY + ")"
      },
      {
        transformOrigin: "left top",
        transform: "translate(0px, 0px) scale(1, 1)"
      }
    ], { duration: 560, easing: "cubic-bezier(.22,1,.36,1)" });

    morph.onfinish = function () {
      overlay.classList.remove("is-flip");
      modal.classList.remove("is-morphing");
    };

    window.setTimeout(function () {
      if (overlay.classList.contains("is-open")) overlay.classList.add("is-revealed");
    }, 150);

    window.setTimeout(function () {
      focusOverlay(overlay);
    }, 60);
  }

  function releaseLaunchedTile() {
    if (!launchedTile) return;
    launchedTile.classList.remove("is-launching");
    launchedTile = null;
  }

  function bundleText(item) {
    return [item.title, item.description, item.comment].filter(function (part) {
      return part && part.trim();
    }).join("\n\n");
  }

  function openOverlay(overlay) {
    if (overlay.hidden) {
      overlay.hidden = false;
      document.body.style.overflow = "hidden";
    }
    if (openStack.indexOf(overlay) === -1) openStack.push(overlay);
    window.requestAnimationFrame(function () {
      overlay.classList.add("is-open");
      var focusTarget = overlay.querySelector("input:not([type=file]), textarea, button.btn-primary, button");
      if (focusTarget) focusTarget.focus({ preventScroll: true });
    });
  }

  function closeOverlay(overlay) {
    if (overlay === detailOverlay && launchedTile) {
      closeDetailMorph();
      return;
    }
    finishClose(overlay, 260);
  }

  function finishClose(overlay, delay) {
    overlay.classList.remove("is-open");
    openStack = openStack.filter(function (entry) { return entry !== overlay; });
    window.setTimeout(function () {
      if (overlay.classList.contains("is-open")) return;
      overlay.hidden = true;
      overlay.classList.remove("is-flip");
      overlay.classList.remove("is-revealed");
      if (overlay === detailOverlay) {
        var modal = overlay.querySelector(".modal");
        modal.classList.remove("is-morphing");
        if (modal.getAnimations) {
          modal.getAnimations().forEach(function (animation) {
            try { animation.cancel(); } catch (err) { }
          });
        }
        releaseLaunchedTile();
      }
      if (!openStack.length) document.body.style.overflow = "";
    }, delay);
  }

  function closeDetailMorph() {
    var overlay = detailOverlay;
    var modal = overlay.querySelector(".modal");
    var origin = launchedTile && launchedTile.isConnected ? launchedTile : null;

    overlay.classList.remove("is-open");

    if (origin && morphEnabled()) {
      overlay.classList.add("is-flip");
      var modalRect = modal.getBoundingClientRect();
      var tileRect = origin.getBoundingClientRect();
      if (modalRect.width && modalRect.height) {
        var scaleX = tileRect.width / modalRect.width;
        var scaleY = tileRect.height / modalRect.height;
        var shiftX = tileRect.left - modalRect.left;
        var shiftY = tileRect.top - modalRect.top;
        modal.classList.add("is-morphing");
        modal.animate([
          { transformOrigin: "left top", transform: "translate(0px, 0px) scale(1, 1)", opacity: 1 },
          {
            transformOrigin: "left top",
            transform: "translate(" + shiftX + "px, " + shiftY + "px) scale(" + scaleX + ", " + scaleY + ")",
            opacity: 0.9
          }
        ], { duration: 300, easing: "cubic-bezier(.4,0,.75,1)", fill: "forwards" });
      }
    }

    finishClose(overlay, 320);
  }

  function closeAll() {
    openStack.slice().forEach(closeOverlay);
  }

  function openEditor(item) {
    editingId = item ? item.id : null;
    editorTitle.textContent = item ? "Редактировать шаблон" : "Новый шаблон";
    fTitle.value = item ? item.title : "";
    fDescription.value = item ? item.description : "";
    fComment.value = item ? item.comment : "";
    formError.hidden = true;
    updateCounters();
    releaseLaunchedTile();
    closeOverlay(detailOverlay);
    openOverlay(editorOverlay);
    window.setTimeout(function () {
      fTitle.focus();
      fTitle.setSelectionRange(fTitle.value.length, fTitle.value.length);
    }, 120);
  }

  function saveFromForm() {
    var title = fTitle.value.trim();
    var description = fDescription.value;
    var comment = fComment.value;

    if (!title) {
      formError.textContent = "Впишите название товара — по нему вы будете искать шаблон.";
      formError.hidden = false;
      fTitle.focus();
      return;
    }
    if (!description.trim() && !comment.trim()) {
      formError.textContent = "Добавьте описание или комментарий — иначе копировать будет нечего.";
      formError.hidden = false;
      fDescription.focus();
      return;
    }
    formError.hidden = true;

    if (editingId) {
      var found = items.find(function (entry) { return entry.id === editingId; });
      if (found) {
        found.title = title;
        found.description = description;
        found.comment = comment;
        found.updatedAt = Date.now();
      }
      persistItems();
      closeOverlay(editorOverlay);
      render({ animate: true });
      showToast("Изменения сохранены");
      return;
    }

    items.unshift({
      id: uid(),
      title: title,
      description: description,
      comment: comment,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    persistItems();
    closeOverlay(editorOverlay);
    render({ animate: true });
    showToast("Шаблон добавлен");
  }

  function updateCounters() {
    cTitle.textContent = String(fTitle.value.length);
    cDescription.textContent = String(fDescription.value.length);
    cComment.textContent = String(fComment.value.length);
  }

  function deleteCurrent() {
    var item = items.find(function (entry) { return entry.id === detailId; });
    if (!item) return;
    if (!window.confirm("Удалить «" + (item.title || "без названия") + "»? Восстановить не получится.")) return;
    items = items.filter(function (entry) { return entry.id !== item.id; });
    persistItems();
    releaseLaunchedTile();
    closeOverlay(detailOverlay);
    render({ animate: true });
    showToast("Шаблон удалён");
  }

  function buildThemeChips() {
    themeRow.textContent = "";
    THEMES.forEach(function (theme, index) {
      var chip = el("button", "theme-chip");
      chip.type = "button";
      chip.dataset.theme = theme.id;
      chip.style.animationDelay = Math.min(index * 45, 320) + "ms";
      chip.classList.toggle("is-active", settings.theme === theme.id);
      var swatch = el("span", "theme-swatch");
      swatch.style.background = theme.swatch;
      swatch.style.setProperty("--dot", theme.dot);
      chip.appendChild(swatch);
      chip.appendChild(document.createTextNode(theme.name));
      chip.addEventListener("click", function () {
        settings.theme = theme.id;
        applyTheme();
        persistSettings();
        buildThemeChips();
      });
      themeRow.appendChild(chip);
    });
  }

  function syncAccentUi() {
    var accent = currentAccent();
    var customActive = settings.accent === "custom";
    accentPicker.value = accent.color;
    if (document.activeElement !== accentHex) accentHex.value = accent.color;
    accentRgb.textContent = "RGB: " + accent.rgb + " · текст на кнопке: " + (accent.ink === "#ffffff" ? "белый" : "тёмный");
    var pickWrap = accentPicker.closest(".color-pick");
    if (pickWrap) pickWrap.classList.toggle("is-active", customActive);
    accentHex.classList.toggle("is-active", customActive);
  }

  function applyCustomAccent(hex) {
    var rgb = parseColor(hex);
    if (!rgb) return false;
    settings.accent = "custom";
    settings.customAccent = toHex(rgb);
    applyTheme();
    persistSettings();
    buildAccentChips();
    return true;
  }

  function buildAccentChips() {
    accentRow.textContent = "";
    ACCENTS.forEach(function (accent, index) {
      var chip = el("button", "accent-chip");
      chip.type = "button";
      chip.dataset.accent = accent.id;
      chip.style.animationDelay = Math.min(index * 45, 320) + "ms";
      chip.style.setProperty("--dot", accent.color);
      chip.classList.toggle("is-active", settings.accent === accent.id);
      chip.setAttribute("aria-label", "Акцент: " + accent.name);
      chip.title = accent.name;
      chip.addEventListener("click", function () {
        settings.accent = accent.id;
        applyTheme();
        persistSettings();
        buildAccentChips();
      });
      accentRow.appendChild(chip);
    });
    syncAccentUi();
  }

  function syncBgUi() {
    var rgb = parseColor(settings.bgColor) || { r: 11, g: 18, b: 32 };
    var hex = toHex(rgb);
    var colorMode = settings.bgPreset === "color" && !customBg;
    bgColorPicker.value = hex;
    if (document.activeElement !== bgColorHex) bgColorHex.value = hex;
    var wrap = bgColorPicker.closest(".color-pick");
    if (wrap) wrap.classList.toggle("is-active", colorMode);
    bgColorHex.classList.toggle("is-active", colorMode);
  }

  function applyCustomBgColor(hex) {
    var rgb = parseColor(hex);
    if (!rgb) return false;
    settings.bgPreset = "color";
    settings.bgColor = toHex(rgb);
    customBg = null;
    dropBg();
    applyBackground();
    persistSettings();
    buildBgChips();
    return true;
  }

  function buildBgChips() {
    bgRow.textContent = "";
    BACKGROUNDS.forEach(function (preset, index) {
      var chip = el("button", "bg-chip");
      chip.type = "button";
      chip.dataset.bg = preset.id;
      chip.style.animationDelay = Math.min(index * 40, 300) + "ms";
      chip.classList.toggle("is-active", settings.bgPreset === preset.id && !customBg);
      var swatch = el("span", "bg-swatch");
      if (preset.css) {
        swatch.style.backgroundImage = preset.css;
      } else if (preset.color) {
        swatch.style.background = preset.color;
      } else {
        swatch.style.background = "repeating-linear-gradient(45deg,var(--surface-3) 0 6px,var(--surface-2) 6px 12px)";
      }
      chip.appendChild(swatch);
      chip.appendChild(document.createTextNode(preset.name));
      chip.addEventListener("click", function () {
        settings.bgPreset = preset.id;
        customBg = null;
        dropBg();
        applyBackground();
        persistSettings();
        buildBgChips();
      });
      bgRow.appendChild(chip);
    });
    syncBgUi();
  }

  function syncSettingsControls() {
    bgDimInput.value = String(settings.bgDim);
    bgBlurInput.value = String(settings.bgBlur);
    bgDimVal.textContent = settings.bgDim + "%";
    bgBlurVal.textContent = settings.bgBlur + " px";
    animToggle.checked = Boolean(settings.animations);
    Array.prototype.forEach.call(sortBar.querySelectorAll(".seg"), function (btn) {
      btn.classList.toggle("is-active", btn.dataset.sort === settings.sort);
    });
  }

  function exportJson() {
    if (!items.length) {
      showToast("Экспортировать пока нечего", true);
      return;
    }
    var payload = {
      app: "playerok-templates",
      version: 2,
      exportedAt: new Date().toISOString(),
      settings: settings,
      items: items
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "playerok-templates-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1200);
    showToast("Файл с шаблонами сохранён");
  }

  function importJson(file) {
    var reader = new FileReader();
    reader.onload = function () {
      var incoming;
      try {
        var parsed = JSON.parse(String(reader.result));
        incoming = Array.isArray(parsed) ? parsed : (parsed && Array.isArray(parsed.items) ? parsed.items : null);
        if (!incoming) throw new Error("shape");
      } catch (err) {
        showToast("Не получилось прочитать файл — нужен JSON из «Экспорта»", true);
        return;
      }

      var known = new Set(items.map(function (entry) { return entry.id; }));
      var added = 0;
      incoming.forEach(function (raw) {
        if (!raw || typeof raw !== "object") return;
        var title = typeof raw.title === "string" ? raw.title : "";
        var description = typeof raw.description === "string" ? raw.description : "";
        var comment = typeof raw.comment === "string" ? raw.comment : "";
        if (!title && !description && !comment) return;
        var id = typeof raw.id === "string" && !known.has(raw.id) ? raw.id : uid();
        items.push({
          id: id,
          title: title,
          description: description,
          comment: comment,
          createdAt: Number(raw.createdAt) || Date.now(),
          updatedAt: Number(raw.updatedAt) || Number(raw.createdAt) || Date.now()
        });
        known.add(id);
        added += 1;
      });

      if (!added) {
        showToast("Новых шаблонов в файле нет", true);
        return;
      }
      persistItems();
      render({ animate: true });
      showToast("Импортировано шаблонов: " + added);
    };
    reader.onerror = function () { showToast("Не удалось прочитать файл", true); };
    reader.readAsText(file);
  }

  function wipeEverything() {
    if (!window.confirm("Удалить все шаблоны и вернуть оформление по умолчанию?")) return;
    items = [];
    persistItems();
    settings = Object.assign({}, DEFAULTS);
    persistSettings();
    customBg = null;
    dropBg();
    applyTheme();
    applyBackground();
    syncSettingsControls();
    buildThemeChips();
    buildAccentChips();
    buildBgChips();
    render({ animate: true });
    closeOverlay(settingsOverlay);
    showToast("Всё очищено");
  }

  document.getElementById("newBtn").addEventListener("click", function () { openEditor(null); });
  document.getElementById("emptyCreate").addEventListener("click", function () { openEditor(null); });
  document.getElementById("settingsBtn").addEventListener("click", function () { openOverlay(settingsOverlay); });
  document.getElementById("exportBtn").addEventListener("click", exportJson);
  document.getElementById("settingsExport").addEventListener("click", exportJson);
  document.getElementById("importBtn").addEventListener("click", function () { importFile.click(); });
  document.getElementById("settingsImport").addEventListener("click", function () { importFile.click(); });
  document.getElementById("wipeBtn").addEventListener("click", wipeEverything);

  importFile.addEventListener("change", function () {
    var file = importFile.files && importFile.files[0];
    if (file) importJson(file);
    importFile.value = "";
  });

  document.getElementById("detailEdit").addEventListener("click", function () {
    var item = items.find(function (entry) { return entry.id === detailId; });
    if (item) openEditor(item);
  });

  document.getElementById("detailDelete").addEventListener("click", deleteCurrent);

  document.getElementById("detailCopyAll").addEventListener("click", function (event) {
    var item = items.find(function (entry) { return entry.id === detailId; });
    if (!item) return;
    copyAndReport(bundleText(item), "Весь шаблон", event.currentTarget);
  });

  saveBtn.addEventListener("click", saveFromForm);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    saveFromForm();
  });

  [fTitle, fDescription, fComment].forEach(function (input) {
    input.addEventListener("input", updateCounters);
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        saveFromForm();
      }
    });
  });

  searchInput.addEventListener("input", function () {
    query = searchInput.value;
    render({ animate: false });
  });

  sortBar.addEventListener("click", function (event) {
    var btn = event.target.closest(".seg");
    if (!btn) return;
    settings.sort = btn.dataset.sort;
    persistSettings();
    syncSettingsControls();
    render({ animate: true });
  });

  document.querySelectorAll("[data-close]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      closeOverlay(btn.closest(".overlay"));
    });
  });

  [detailOverlay, editorOverlay, settingsOverlay].forEach(function (overlay) {
    overlay.addEventListener("mousedown", function (event) {
      if (event.target === overlay) closeOverlay(overlay);
    });
  });

  bgDimInput.addEventListener("input", function () {
    settings.bgDim = Number(bgDimInput.value);
    bgDimVal.textContent = settings.bgDim + "%";
    applyBackground();
  });

  bgDimInput.addEventListener("change", persistSettings);

  bgBlurInput.addEventListener("input", function () {
    settings.bgBlur = Number(bgBlurInput.value);
    bgBlurVal.textContent = settings.bgBlur + " px";
    applyBackground();
  });

  bgBlurInput.addEventListener("change", persistSettings);

  animToggle.addEventListener("change", function () {
    settings.animations = animToggle.checked;
    applyTheme();
    persistSettings();
  });

  accentPicker.addEventListener("input", function () {
    applyCustomAccent(accentPicker.value);
  });

  accentHex.addEventListener("input", function () {
    var rgb = parseColor(accentHex.value);
    if (!rgb) return;
    settings.accent = "custom";
    settings.customAccent = toHex(rgb);
    applyTheme();
    persistSettings();
    accentPicker.value = settings.customAccent;
    accentRgb.textContent = "RGB: " + rgb.r + ", " + rgb.g + ", " + rgb.b + " · текст на кнопке: " + (inkFor(rgb) === "#ffffff" ? "белый" : "тёмный");
    var pickWrap = accentPicker.closest(".color-pick");
    if (pickWrap) pickWrap.classList.add("is-active");
    accentHex.classList.add("is-active");
    Array.prototype.forEach.call(accentRow.children, function (chip) {
      chip.classList.remove("is-active");
    });
  });

  accentHex.addEventListener("blur", function () {
    accentHex.value = currentAccent().color;
  });

  bgColorPicker.addEventListener("input", function () {
    applyCustomBgColor(bgColorPicker.value);
  });

  bgColorHex.addEventListener("input", function () {
    var rgb = parseColor(bgColorHex.value);
    if (!rgb) return;
    applyCustomBgColor(toHex(rgb));
  });

  bgColorHex.addEventListener("blur", function () {
    bgColorHex.value = bgColorPicker.value;
  });

  bgFile.addEventListener("change", function () {
    var file = bgFile.files && bgFile.files[0];
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      showToast("Нужен файл изображения", true);
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      showToast("Файл больше 12 МБ — выберите изображение поменьше", true);
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      customBg = String(reader.result);
      applyBackground();
      buildBgChips();
      saveBg(customBg).then(function () {
        showToast("Фон обновлён");
      }).catch(function () {
        showToast("Не удалось сохранить фото, но фон применён", true);
      });
    };
    reader.onerror = function () { showToast("Не удалось прочитать изображение", true); };
    reader.readAsDataURL(file);
    bgFile.value = "";
  });

  document.getElementById("bgClear").addEventListener("click", function () {
    customBg = null;
    dropBg();
    applyBackground();
    buildBgChips();
    showToast("Фото фона убрано");
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && openStack.length) {
      closeOverlay(openStack[openStack.length - 1]);
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n") {
      event.preventDefault();
      openEditor(null);
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") {
      event.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  });

  if (window.playerokDesktop && window.playerokDesktop.isDesktop) {
    var winControls = document.getElementById("winControls");
    winControls.hidden = false;
    winControls.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-win]");
      if (!btn) return;
      var action = btn.dataset.win;
      if (action === "min") window.playerokDesktop.minimize();
      if (action === "max") window.playerokDesktop.maximize();
      if (action === "close") window.playerokDesktop.close();
    });
  }

  items = loadItems();
  loadSettings();
  syncSettingsControls();
  applyTheme();
  applyBackground();
  buildThemeChips();
  buildAccentChips();
  buildBgChips();
  render({ animate: true });

  readBg().then(function (dataUrl) {
    if (!dataUrl) return;
    customBg = dataUrl;
    applyBackground();
    buildBgChips();
  });

  if (window.location.protocol === "file:") {
    window.setTimeout(function () {
      if (!storageOk) setStorageState(false);
    }, 300);
  }
})();
