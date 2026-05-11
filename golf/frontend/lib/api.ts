import type { Course, CourseCreate, Round, RoundCreate } from "./types";

const DEFAULT_API_URL = "http://localhost:8000";

const apiBaseUrl = () =>
  (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/+$/, "");

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

async function apiRequest<T>(
  path: string,
  { body, headers, ...options }: ApiRequestOptions = {},
): Promise<T> {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...options,
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `API request failed (${response.status} ${response.statusText})${
        message ? `: ${message}` : ""
      }`,
    );
  }

  return response.json() as Promise<T>;
}

export function fetchCourses(): Promise<Course[]> {
  return apiRequest<Course[]>("/api/courses", { cache: "no-store" });
}

export function createCourse(course: CourseCreate): Promise<Course> {
  return apiRequest<Course>("/api/courses", {
    method: "POST",
    body: course,
  });
}

export function fetchRounds(courseId?: number): Promise<Round[]> {
  const query =
    courseId === undefined
      ? ""
      : `?${new URLSearchParams({ course_id: String(courseId) })}`;

  return apiRequest<Round[]>(`/api/rounds${query}`, { cache: "no-store" });
}

export function createRound(round: RoundCreate): Promise<Round> {
  return apiRequest<Round>("/api/rounds", {
    method: "POST",
    body: round,
  });
}
