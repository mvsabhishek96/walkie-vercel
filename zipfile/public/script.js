let client;
let localAudioTrack;
const channel = "walkiechannel";

async function initAgora() {
  // Fetch token from your API
  const res = await fetch("/api/generateToken");
  const data = await res.json();
  const token = data.token;
  const appId = data.appId;

  // Create Agora client
  client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  client.on("connection-state-change", (curState, revState, reason) => {
    console.log("Connection state change:", curState, revState, reason);
  });

  try {
    await client.join(appId, channel, token, null);
    console.log("Joined channel successfully");

    // Create local audio track
    localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  } catch (err) {
    console.error("Failed to join channel:", err);
  }
}

// Push-to-Talk button
const pttButton = document.getElementById("pttButton");
pttButton.addEventListener("mousedown", async () => {
  if (!localAudioTrack) return;
  await client.publish([localAudioTrack]);
  console.log("Talking...");
});
pttButton.addEventListener("mouseup", async () => {
  if (!localAudioTrack) return;
  await client.unpublish([localAudioTrack]);
  console.log("Stopped talking");
});

initAgora();
