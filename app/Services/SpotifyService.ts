type Environment = {
  SPOTIFY_CLIENT_ID: string | undefined;
  SPOTIFY_CLIENT_SECRET: string | undefined;
}

type SpotifyAuthResponse =  {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export class SpotifyService {
  public async getAccessToken(): Promise<SpotifyAuthResponse> {
    const url = "https://accounts.spotify.com/api/token";
    const client_id: Environment["SPOTIFY_CLIENT_ID"] = process.env?.SPOTIFY_CLIENT_ID;
    const client_secret: Environment["SPOTIFY_CLIENT_SECRET"] = process.env?.SPOTIFY_CLIENT_SECRET;

    if (!client_id || !client_secret) throw new Error("Missing client_id or client_secret");

    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", client_id);
    params.append("client_secret", client_secret);

    const res: Response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const data = (await res.json()) as SpotifyAuthResponse;
    return data;
  }
}
