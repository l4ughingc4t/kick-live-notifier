// popup.js

const streamerInput = document.getElementById("streamerInput");
const addBtn = document.getElementById("addBtn");
const checkBtn = document.getElementById("checkBtn");
const streamerList = document.getElementById("streamerList");
const emptyState = document.getElementById("emptyState");
const errorMsg = document.getElementById("errorMsg");
const liveCount = document.getElementById("liveCount");
const liveStatDot = document.getElementById("liveStatDot");
const totalCount = document.getElementById("totalCount");
const lastChecked = document.getElementById("lastChecked");

let streamers = [];
let statuses = {};

// Load and render on open
async function init() {
  const data = await chrome.storage.sync.get(["streamers"]);
  streamers = data.streamers || [];

  // Get cached statuses
  const local = await chrome.storage.local.get(["streamerStatuses"]);
  statuses = local.streamerStatuses || {};

  render();
}

function render() {
  // Update stats
  const liveStreamers = streamers.filter((u) => statuses[u]?.isLive);
  const liveNum = liveStreamers.length;
  liveCount.textContent = liveNum;
  totalCount.textContent = streamers.length;
  liveStatDot.style.display = liveNum > 0 ? "" : "none";

  // Last checked time
  const times = Object.values(statuses)
    .map((s) => s.lastChecked)
    .filter(Boolean);
  if (times.length > 0) {
    const latest = Math.max(...times);
    const diff = Math.floor((Date.now() - latest) / 1000);
    if (diff < 60) {
      lastChecked.textContent = `${diff}秒前に確認`;
    } else {
      lastChecked.textContent = `${Math.floor(diff / 60)}分前に確認`;
    }
  }

  // Render list
  if (streamers.length === 0) {
    emptyState.style.display = "";
    // Remove all items except empty state
    const items = streamerList.querySelectorAll(".streamer-item");
    items.forEach((i) => i.remove());
    return;
  }

  emptyState.style.display = "none";

  // Sort: live first, then alphabetical
  const sorted = [...streamers].sort((a, b) => {
    const aLive = statuses[a]?.isLive ? 1 : 0;
    const bLive = statuses[b]?.isLive ? 1 : 0;
    if (aLive !== bLive) return bLive - aLive;
    return a.localeCompare(b);
  });

  // Clear and rebuild
  const existing = streamerList.querySelectorAll(".streamer-item");
  existing.forEach((i) => i.remove());

  for (const username of sorted) {
    const status = statuses[username];
    const isLive = status?.isLive === true;
    const isUnknown = !status;

    const item = document.createElement("div");
    item.className = "streamer-item";
    item.dataset.username = username;

    const indicatorClass = isUnknown ? "unknown" : isLive ? "live" : "offline";
    const badgeClass = isLive ? "live" : "offline";
    const badgeText = isLive ? "LIVE" : isUnknown ? "..." : "OFFLINE";

    item.innerHTML = `
      <div class="status-indicator ${indicatorClass}"></div>
      <div class="streamer-name">
        <a href="https://kick.com/${encodeURIComponent(username)}" target="_blank">${escapeHtml(username)}</a>
      </div>
      <span class="streamer-badge ${badgeClass}">${badgeText}</span>
      <button class="delete-btn" data-username="${escapeHtml(username)}" title="削除">✕</button>
    `;

    streamerList.appendChild(item);
  }

  // Add delete listeners
  streamerList.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeStreamer(btn.dataset.username);
    });
  });
}

async function addStreamer() {
  const value = streamerInput.value.trim().toLowerCase();
  if (!value) return;

  // Basic validation
  if (!/^[a-z0-9_]{1,50}$/.test(value)) {
    showError("有効なユーザー名を入力してください（英数字・_のみ）");
    return;
  }

  if (streamers.includes(value)) {
    showError("すでに追加されています");
    return;
  }

  streamers.push(value);
  await chrome.storage.sync.set({ streamers });
  streamerInput.value = "";
  hideError();
  render();

  // Trigger a check for the new streamer immediately
  chrome.runtime.sendMessage({ action: "checkNow" }, () => {
    chrome.storage.local.get(["streamerStatuses"], (result) => {
      statuses = result.streamerStatuses || {};
      render();
    });
  });
}

async function removeStreamer(username) {
  streamers = streamers.filter((u) => u !== username);
  await chrome.storage.sync.set({ streamers });

  // Also clean up local status
  delete statuses[username];
  await chrome.storage.local.set({ streamerStatuses: statuses });

  render();
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.style.display = "block";
  setTimeout(hideError, 3000);
}

function hideError() {
  errorMsg.style.display = "none";
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

// Event listeners
addBtn.addEventListener("click", addStreamer);
streamerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addStreamer();
});

checkBtn.addEventListener("click", () => {
  checkBtn.textContent = "確認中...";
  checkBtn.classList.add("loading");

  chrome.runtime.sendMessage({ action: "checkNow" }, () => {
    chrome.storage.local.get(["streamerStatuses"], (result) => {
      statuses = result.streamerStatuses || {};
      render();
      checkBtn.textContent = "↻ 今すぐ確認";
      checkBtn.classList.remove("loading");
    });
  });
});

init();
