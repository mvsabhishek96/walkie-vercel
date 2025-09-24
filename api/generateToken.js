const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

export default function handler(req, res) {
  const appID = "59595697a95d4d819dda18070b4f5ffe"; // Your Agora App ID
  const appCertificate = "66ed800ef2f54df9bee2ac87badf2210"; // Your Primary Certificate

  const channelName = req.query.channel || "default";
  const uid = Math.floor(Math.random() * 100000);
  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600; // token valid for 1 hour

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appID,
    appCertificate,
    channelName,
    uid,
    role,
    privilegeExpiredTs
  );

  res.status(200).json({ token, uid });
}
