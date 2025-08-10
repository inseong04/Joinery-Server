  import { Profile } from "passport-google-oauth20";

  export interface Profile extends Profile {
    genders?: { value: string }[];
    birthdays?: {
      date: {
        year?: number;
        month: number;
        day: number;
      };
    }[];
  }
