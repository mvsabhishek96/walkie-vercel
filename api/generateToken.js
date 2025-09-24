import { RtcTokenBuilder, RtcRole } from "agora-access-token";

export default function handler(req, res) {
  const { channel } = req.query;

  if (!channel) {
    res.status(400).json({ error: "Channel name required" });
    return;
  }

  const appID = "YOUR_AGORA_APP_ID";           // replace with your App ID
  const appCertificate = "YOUR_AGORA_CERT";    // replace with your certificate
  const uid = Math.floor(Math.random() * 100000);
  const expirationTimeInSeconds = 3600;

  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expirationTimeInSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appID,
    appCertificate,
    channel,
    uid,
    RtcRole.PUBLISHER,
    privilegeExpireTime
  );

  res.status(200).json({ token, uid });
}
