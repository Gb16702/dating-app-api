import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { SpotifyService } from "../../Services/SpotifyService";

type NormalizedData = {
  id: string;
  artist: string;
  title: string;
  album: string;
  image: string;
  preview: string;
};

export default class SpotifyDataController {
  private spotifyService: SpotifyService;
  constructor() {
    this.spotifyService = new SpotifyService();
  }

  public normalizeData({ tracks }: Record<string, string | any>): Array<NormalizedData> {
    if (!tracks || !Array.isArray(tracks.items)) {
        throw new Error("Invalid data structure");
    }

    return tracks.items.map((i: Record<string, string | any>) => {
      return {
        id: i.id,
        artist: i.artists[0].name,
        title: i.name,
        album: i.album.name,
        image: i.album.images[0].url,
        preview: i.preview_url,
      };
    });
  }

  public async search({ request, response }: HttpContextContract) {
    const { query: q } = request.qs();
    const url = `https://api.spotify.com/v1/search?q=${q}&type=track&market=BE&limit=5`;
    const { access_token: token } = await this.spotifyService.getAccessToken();

    if (!token) return response.badRequest({ message: "No token provided" });

    try {
      const res: Response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.ok({
        tracks: this.normalizeData((await res.json()) as Record<string, string | any>),
      });

    } catch (e) {
      return response.badRequest({ message: e });
    }
  }
}
