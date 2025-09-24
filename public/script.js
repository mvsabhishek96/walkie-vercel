// public/script.js
// Uses the global AgoraRTC loaded by the CDN script in index.html

const joinBtn = document.getElementById("joinBtn");
const leaveBtn = document.getElementById("leaveBtn");
const pttBtn = document.getElementById("pttBtn");
const statusDiv = document.getElementById("status");

const CHANNEL = "walkiechannel";

let client = null;
let localAudioTrack = null;
let joined = false;
let currentTokenExpiry = 0;

// Fetch a fresh token from the server
async function fetchToken() {
  const res = await fetch("/api/generateToken");
  if (!res.ok) throw new Error("Failed to fetch token");
  const data = await res.json();
  return data;
}

// Create client and attach event listeners
function createClient() {
  if (client) return client;
  client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  client.on("connection-state-change", (cur, rev, reason) => {
    console.log("Connection state change:", rev, "->", cur, reason);
    statusDiv.innerText = `Connection: ${cur}`;
  });

  // Token will expire soon — get a new one and renew
  client.on("token-privilege-will-expire", async () => {
    console.log("Token will expire soon — renewing");
    try {
      const data = await fetchToken();
      await client.renewToken(data.token);
      currentTokenExpiry = data.expiresAt || (Math.floor(Date.now() / 1000) + 24 * 3600);
      console.log("Token renewed successfully");
    } catch (err) {
      console.error("Token renew failed:", err);
    }
  });

  // If token already expired while client running
  client.on("token-privilege-did-expire", async () => {
    console.log("Token did expire — fetching new token and rejoining");
    // Attempt to fetch and renew (or rejoin) gracefully
    try {
      const data = await fetchToken();
      await client.renewToken(data.token);
      currentTokenExpiry = data.expiresAt || (Math.floor(Date.now() / 1000) + 24 * 3600);
      console.log("Token replaced after expiry");
    } catch (err) {
      console.error("Failed to replace expired token:", err);
    }
  });

  client.on("user-published", async (user, mediaType) => {
    try {
      await client.subscribe(user, mediaType);
      if (mediaType === "audio") {
        user.audioTrack.play();
      }
    } catch (e) {
      console.error("Subscribe failed:", e);
    }
  });

  return client;
}

async function joinChannel() {
  if (joined) return;
  createClient();

  let tokenData;
  try {
    tokenData = await fetchToken();
  } catch (err) {
    console.error("Could not get token:", err);
    alert("Failed to get token from server. Check /api/generateToken.");
    return;
  }

  const appId = tokenData.appId;
  const token = tokenData.token;
  currentTokenExpiry = tokenData.expiresAt || (Math.floor(Date.now() / 1000) + 24 * 3600);

  try {
    await client.join(appId, CHANNEL, token, null);
    // prepare mic track but do not publish immediately
    localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    joined = true;
    joinBtn.disabled = true;
    leaveBtn.disabled = false;
    pttBtn.disabled = false;
    statusDiv.innerText = "Joined. Ready.";
    console.log("Joined channel:", CHANNEL);
  } catch (err) {
    console.error("Join channel failed:", err);
    statusDiv.innerText = "Join failed: " + (err.message || err);
  }
}

async function leaveChannel() {
  if (!joined) return;
  try {
    if (localAudioTrack) {
      try { await client.unpublish([localAudioTrack]); } catch (_) {}
      localAudioTrack.stop();
      localAudioTrack.close();
      localAudioTrack = null;
    }
    await client.leave();
  } catch (err) {
    console.warn("Leave error:", err);
  } finally {
    joined = false;
    joinBtn.disabled = false;
    leaveBtn.disabled = true;
    pttBtn.disabled = true;
    statusDiv.innerText = "Left";
  }
}

async function startTalking() {
  if (!joined) {
    await joinChannel();
    // small delay might be required for track readiness
  }
  if (!localAudioTrack) {
    localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  }
  try {
    await client.publish([localAudioTrack]);
    pttBtn.classList.add("talking");
    pttBtn.setAttribute("aria-pressed", "true");
    statusDiv.innerText = "Talking...";
  } catch (err) {
    console.error("Publish failed:", err);
  }
}

async function stopTalking() {
  try {
    if (localAudioTrack) {
      await client.unpublish([localAudioTrack]);
    }
  } catch (err) {
    console.warn("Unpublish failed:", err);
  } finally {
    pttBtn.classList.remove("talking");
    pttBtn.setAttribute("aria-pressed", "false");
    statusDiv.innerText = "Ready";
  }
}

// mouse + touch handlers
pttBtn.addEventListener("mousedown", (e) => {
  e.preventDefault();
  startTalking();
});
pttBtn.addEventListener("mouseup", (e) => {
  e.preventDefault();
  stopTalking();
});
pttBtn.addEventListener("mouseleave", (e) => {
  // if pointer leaves while pressed, stop talking
  if (e.buttons === 1) stopTalking();
});

pttBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  startTalking();
}, {passive:false});
pttBtn.addEventListener("touchend", (e) => {
  e.preventDefault();
  stopTalking();
}, {passive:false});

// join/leave button events
joinBtn.addEventListener("click", joinChannel);
leaveBtn.addEventListener("click", leaveChannel);

// clean up on unload
window.addEventListener("beforeunload", async () => {
  try {
    if (localAudioTrack) {
      await client.unpublish([localAudioTrack]);
      localAudioTrack.stop();
      localAudioTrack.close();
    }
    if (client) await client.leave();
  } catch (e) { /* ignore */ }
});
