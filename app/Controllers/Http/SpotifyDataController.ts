import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { SpotifyService } from "../../Services/SpotifyService";

export type NormalizedData = {
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

  public normalizeData({
    tracks,
  }: Record<string, string | any>): Array<NormalizedData> {
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

  public normalizeGetTrackData(trackData: any): NormalizedData {
    return {
      id: trackData.id,
      title: trackData.name,
      artist: trackData.artists[0].name,
      album: trackData.album.name,
      image: trackData.album.images[0].url,
      preview: trackData.preview_url,
    };
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
        tracks: this.normalizeData(
          (await res.json()) as Record<string, string | any>
        ),
      });
    } catch (e) {
      return response.badRequest({ message: e });
    }
  }

  public async getTrack({ request, response }: HttpContextContract) {
    const { array }: any = request.body();
    if (!array) return response.badRequest({ message: "No tracks provided" });

    const tracksData: Array<NormalizedData> = [];

    for (const trackId of array) {
      const url: string = `https://api.spotify.com/v1/tracks/${trackId}`;
      const { access_token: token } =
        await this.spotifyService.getAccessToken();

      try {
        const res: Response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const trackData: any = await res.json();
          tracksData.push(this.normalizeGetTrackData(trackData));
        }
      } catch (e) {
        console.error(`Request failed for retrieving track data`);
        return response.internalServerError({
          message: "Failed to fetch track data",
        });
      }
    }

    return response.ok({ tracksData });
  }
}
