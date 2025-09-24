// api/generateToken.js
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

module.exports = function handler(req, res) {
  const APP_ID = "59595697a95d4d819dda18070b4f5ffe";
  const APP_CERTIFICATE = "66ed800ef2f54df9bee2ac87badf2210";

  const channelName = "walkiechannel";
  const role = RtcRole.PUBLISHER;

  // UID 0 means Agora will assign one
  const uid = 0;

  // Current timestamp in seconds
  const currentTime = Math.floor(Date.now() / 1000);

  // Expire 24 hours from now
  const privilegeExpireTs = currentTime + 24 * 3600; // 24 hours

  try {
    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      uid,
      role,
      privilegeExpireTs
    );

    res.status(200).json({
      appId: APP_ID,
      channel: channelName,
      token,
      expiresAt: privilegeExpireTs
    });
  } catch (err) {
    console.error("Error generating token:", err);
    res.status(500).json({ error: "Failed to generate token" });
  }
};
