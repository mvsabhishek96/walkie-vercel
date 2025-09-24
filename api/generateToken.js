import { RtcTokenBuilder, RtcRole } from "agora-access-token";

export default function handler(req, res) {
  const APP_ID = "59595697a95d4d819dda18070b4f5ffe";
  const APP_CERTIFICATE = "66ed800ef2f54df9bee2ac87badf2210";

  // Single fixed channel name
  const channelName = "walkiechannel";

  // Anyone can be publisher (so they can speak)
  const role = RtcRole.PUBLISHER;

  // Expiry time in seconds (here: 1 hour)
  const expireTime = 3600;

  // UID 0 lets Agora assign automatically
  const uid = 0;

  // Generate the token
  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    expireTime
  );

  res.status(200).json({
    appId: APP_ID,
    channel: channelName,
    token
  });
}
