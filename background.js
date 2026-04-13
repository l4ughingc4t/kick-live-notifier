// background.js - Service Worker

const CHECK_INTERVAL_MS = 10000; // Check every 10 seconds

// Start polling loop
function startPolling() {
  checkAllStreamers();
  setInterval(checkAllStreamers, CHECK_INTERVAL_MS);
  console.log("Kick Live Notifier: checking every", CHECK_INTERVAL_MS / 1000, "seconds.");
}

chrome.runtime.onInstalled.addListener(startPolling);
chrome.runtime.onStartup.addListener(startPolling);

// Also listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "checkNow") {
    checkAllStreamers().then(() => sendResponse({ success: true }));
    return true; // Keep channel open for async response
  }
  if (message.action === "getStatuses") {
    chrome.storage.local.get(["streamerStatuses"], (result) => {
      sendResponse({ statuses: result.streamerStatuses || {} });
    });
    return true;
  }
});

async function checkAllStreamers() {
  const { streamers } = await chrome.storage.sync.get(["streamers"]);
  if (!streamers || streamers.length === 0) return;

  const { streamerStatuses } = await chrome.storage.local.get(["streamerStatuses"]);
  const previousStatuses = streamerStatuses || {};
  const newStatuses = {};

  for (const username of streamers) {
    try {
      const isLive = await checkStreamerStatus(username);
      newStatuses[username] = {
        isLive,
        lastChecked: Date.now(),
      };

      // Was offline before, now live → notify!
      const wasLive = previousStatuses[username]?.isLive;
      if (isLive && !wasLive) {
        sendLiveNotification(username);
      }
    } catch (err) {
      console.error(`Error checking ${username}:`, err);
      // Keep previous status on error
      if (previousStatuses[username]) {
        newStatuses[username] = previousStatuses[username];
      }
    }
  }

  await chrome.storage.local.set({ streamerStatuses: newStatuses });
}

async function checkStreamerStatus(username) {
  // Kick's public API endpoint for channel info
  const url = `https://kick.com/api/v1/channels/${encodeURIComponent(username)}`;
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0",
    },
  });

  if (!response.ok) {
    if (response.status === 404) return false; // Channel not found
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  // Kick API: livestream is null when offline, object when live
  return data?.livestream !== null && data?.livestream !== undefined;
}

function sendLiveNotification(username) {
  chrome.notifications.create(`live-${username}-${Date.now()}`, {
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: "🔴 配信開始！",
    message: `${username} がKickでライブを開始しました！`,
    priority: 2,
    buttons: [{ title: "視聴する" }],
  });
}

// Handle notification button click
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (buttonIndex === 0) {
    const parts = notificationId.split("-");
    if (parts[0] === "live" && parts.length >= 2) {
      const username = parts[1];
      chrome.tabs.create({ url: `https://kick.com/${username}` });
    }
  }
});

// Handle notification click
chrome.notifications.onClicked.addListener((notificationId) => {
  const parts = notificationId.split("-");
  if (parts[0] === "live" && parts.length >= 2) {
    const username = parts[1];
    chrome.tabs.create({ url: `https://kick.com/${username}` });
  }
});
