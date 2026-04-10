import { OAuth2Client } from "google-auth-library";

let oauthClient;

const getGoogleClient = () => {
  if (!oauthClient) {
    oauthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  return oauthClient;
};

export const verifyGoogleCredential = async (credential) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    const error = new Error("GOOGLE_CLIENT_ID is not configured on the server.");
    error.statusCode = 500;
    throw error;
  }

  try {
    const ticket = await getGoogleClient().verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    return ticket.getPayload();
  } catch (_error) {
    const error = new Error("Google credential verification failed.");
    error.statusCode = 401;
    throw error;
  }
};
