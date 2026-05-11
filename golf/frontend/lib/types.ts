export type Course = {
  id: number;
  name: string;
  location: string;
  holes: number;
  par: number;
};

export type CourseCreate = Omit<Course, "id">;

export type Round = {
  id: number;
  course_id: number;
  player_name: string;
  score: number;
  date_played: string;
};

export type RoundCreate = Omit<Round, "id">;
