export type ProfileSetupPayload = {
  first_name: string;
  last_name: string;
  city_id: number;
  date_of_birth: any;
  gender: number;
  gender_preference: number;
  bio: string | undefined;
  favorite_tracks_ids: (number | undefined)[];
};
