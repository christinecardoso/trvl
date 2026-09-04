/**
 * Timetable: select-to-inspect (keep calendar context; don't navigate on block click).
 */
function initTimetable() {
  const root = document.querySelector("[data-tt-detail]");
  const dataEl = document.getElementById("timetable-blocks-data");
  if (!root || !dataEl) return;

  let blocksById = {};
  try {
    blocksById = JSON.parse(dataEl.textContent || "{}");
  } catch {
    return;
  }

  const empty = root.querySelector("[data-tt-empty]");
  const body = root.querySelector("[data-tt-body]");
  const kicker = root.querySelector("[data-tt-kicker]");
  const title = root.querySelector("[data-tt-title]");
  const when = root.querySelector("[data-tt-when]");
  const meta = root.querySelector("[data-tt-meta]");
  const placesEl = root.querySelector("[data-tt-places]");
  const excerpt = root.querySelector("[data-tt-excerpt]");
  const dayLink = root.querySelector("[data-tt-day-link]");
  const placeLink = root.querySelector("[data-tt-place-link]");
  const closeBtn = root.querySelector("[data-tt-close]");
  const buttons = [...document.querySelectorAll("[data-tt-block]")];

  let active = null;

  function clear() {
    if (active) {
      active.classList.remove("is-selected");
      active.setAttribute("aria-expanded", "false");
    }
    active = null;
    root.classList.remove("is-open");
    empty.hidden = false;
    body.hidden = true;
  }

  function metaItem(label, value) {
    if (!value) return "";
    return `<li><span>${label}</span><strong>${escapeHtml(value)}</strong></li>`;
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function renderList(items, heading, countLabel) {
    if (!placesEl) return;
    if (!Array.isArray(items) || !items.length) {
      placesEl.hidden = true;
      placesEl.innerHTML = "";
      return;
    }

    const itemsHtml = items.map((p) => {
      const name = escapeHtml(p.name || p.title || "Option");
      const type = p.type
        ? `<span class="stop-options-type">${escapeHtml(p.type)}</span>`
        : "";
      const notes = p.notes
        ? `<p class="stop-options-notes">${escapeHtml(p.notes)}</p>`
        : "";
      const href = p.url || (p.slug ? `/${p.slug}/` : "");
      const nameHtml = href
        ? `<a class="stop-options-name" href="${escapeHtml(href)}">${name}</a>`
        : `<span class="stop-options-name">${name}</span>`;

      return `<li class="stop-options-item">
        <div class="stop-options-main">${nameHtml}${type}</div>
        ${notes}
      </li>`;
    }).join("");

    const wrapperClass = countLabel === "options" ? "stop-options" : "place-collection";
    const nameClass = countLabel === "options" ? "stop-options" : "place-collection";
    placesEl.hidden = false;
    placesEl.innerHTML = `
      <div class="${wrapperClass}">
        <h3 class="${nameClass}-heading">
          ${escapeHtml(heading)}
          <span class="${nameClass}-count">${items.length}</span>
        </h3>
        <ol class="${nameClass}-list">${itemsHtml}</ol>
      </div>
    `;
  }

  function renderPlaces(places) {
    renderList(places, "Inside this stop", "places");
  }

  function renderOptions(options) {
    renderList(options, "Pick one", "options");
  }

  function select(btn) {
    const id = btn.dataset.ttId;
    const data = blocksById[id];
    if (!data) return;

    if (active === btn) {
      clear();
      return;
    }

    if (active) {
      active.classList.remove("is-selected");
      active.setAttribute("aria-expanded", "false");
    }

    active = btn;
    active.classList.add("is-selected");
    active.setAttribute("aria-expanded", "true");
    root.classList.add("is-open");
    empty.hidden = true;
    body.hidden = false;

    const label = data.label || "Stop";
    const day = data.day || "";
    const date = data.niceDate || "";
    const start = data.startLabel || "";
    const end = data.endLabel || "";
    const count = data.optionCount || (data.options?.length ?? 0);
    const placeCount = data.placeCount || (data.places?.length ?? 0);
    const parent = data.parentTitle || "";

    kicker.textContent = `${label}${parent ? ` · ${parent}` : ""} · Day ${day}${date ? ` · ${date}` : ""}${
      data.scheduleTime ? ` · ${data.scheduleTime}` : ""
    }${
      count ? ` · ${count} options` : placeCount ? ` · ${placeCount} places` : ""
    }`;
    title.textContent = data.title || "Untitled";
    when.textContent = end && end !== start ? `${start} – ${end}` : start;

    meta.innerHTML = [
      metaItem("Allow", data.visit_time),
      metaItem("Travel", data.travel_time),
      metaItem("Category", data.travel_category),
    ].join("");

    if (data.options?.length) {
      renderOptions(data.options);
    } else {
      renderPlaces(data.places);
    }

    const ex = String(data.excerpt || "").trim();
    excerpt.hidden = !ex;
    excerpt.textContent = ex;

    dayLink.href = data.dayUrl || "#";
    if (data.url) {
      placeLink.hidden = false;
      placeLink.href = data.url;
      if (data.isOptions) {
        placeLink.textContent = "Open stop page";
      } else if (placeCount) {
        placeLink.textContent = "Open circuit page";
      } else {
        placeLink.textContent = "Open place page";
      }
    } else {
      placeLink.hidden = true;
    }

    if (window.matchMedia("(max-width: 959px)").matches) {
      root.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  for (const btn of buttons) {
    btn.addEventListener("click", () => select(btn));
  }

  closeBtn?.addEventListener("click", () => {
    const prev = active;
    clear();
    prev?.focus();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && active) {
      const prev = active;
      clear();
      prev.focus();
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTimetable);
} else {
  initTimetable();
}
