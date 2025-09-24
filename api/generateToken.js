import { RtcTokenBuilder, RtcRole } from "agora-access-token";

export default function handler(req, res) {
  const APP_ID = "59595697a95d4d819dda18070b4f5ffe";
  const APP_CERTIFICATE = "66ed800ef2f54df9bee2ac87badf2210";

  const channelName = "walkiechannel";
  const role = RtcRole.PUBLISHER;

  // 24 hours in seconds
  const expireTime = 24 * 3600;

  const uid = 0; // let Agora assign UID automatically

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
