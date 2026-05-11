"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { createRound, fetchCourses } from "@/lib/api";
import type { Course, RoundCreate } from "@/lib/types";

type RoundFormValues = {
  course_id: string;
  player_name: string;
  score: string;
  date_played: string;
};

type RoundFormErrors = Partial<Record<keyof RoundFormValues, string>>;

const today = new Date().toISOString().slice(0, 10);

const initialValues: RoundFormValues = {
  course_id: "",
  player_name: "",
  score: "",
  date_played: today,
};

function parsePositiveInteger(value: string): number | null {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function validateRound(values: RoundFormValues): {
  round: RoundCreate | null;
  errors: RoundFormErrors;
} {
  const errors: RoundFormErrors = {};
  const courseId = parsePositiveInteger(values.course_id);
  const score = parsePositiveInteger(values.score);
  const playerName = values.player_name.trim();

  if (courseId === null) {
    errors.course_id = "Select a course.";
  }

  if (!playerName) {
    errors.player_name = "Enter a player name.";
  }

  if (score === null) {
    errors.score = "Enter a whole number score.";
  } else if (score > 300) {
    errors.score = "Score must be 300 or less.";
  }

  if (!values.date_played) {
    errors.date_played = "Select the date played.";
  }

  if (Object.keys(errors).length > 0 || courseId === null || score === null) {
    return { round: null, errors };
  }

  return {
    round: {
      course_id: courseId,
      player_name: playerName,
      score,
      date_played: values.date_played,
    },
    errors,
  };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Unable to create the round. Please try again.";
}

export default function NewRoundPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [values, setValues] = useState<RoundFormValues>(initialValues);
  const [errors, setErrors] = useState<RoundFormErrors>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    async function loadCourses() {
      setIsLoadingCourses(true);
      setLoadError(null);

      try {
        const loadedCourses = await fetchCourses();

        if (isCurrent) {
          setCourses(loadedCourses);
          setValues((currentValues) => ({
            ...currentValues,
            course_id:
              currentValues.course_id || loadedCourses[0]?.id.toString() || "",
          }));
        }
      } catch (caughtError) {
        if (isCurrent) {
          setLoadError(getErrorMessage(caughtError));
        }
      } finally {
        if (isCurrent) {
          setIsLoadingCourses(false);
        }
      }
    }

    loadCourses();

    return () => {
      isCurrent = false;
    };
  }, []);

  function updateValue(field: keyof RoundFormValues, value: string) {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const validation = validateRound(values);
    setErrors(validation.errors);

    if (!validation.round) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createRound(validation.round);
      router.push("/rounds");
    } catch (caughtError) {
      setSubmitError(getErrorMessage(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  }

  const isFormDisabled = isLoadingCourses || isSubmitting || courses.length === 0;

  return (
    <section className="space-y-8">
      <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          New round
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Record a scorecard
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Choose a course, add the player and score, then save the round to the
          shared log.
        </p>
      </div>

      {loadError ? (
        <div
          className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-800"
          role="alert"
        >
          <h2 className="font-semibold">Could not load courses</h2>
          <p className="mt-2 text-sm">{loadError}</p>
        </div>
      ) : null}

      {!isLoadingCourses && !loadError && courses.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-emerald-300 bg-white p-8 text-center">
          <p className="text-lg font-semibold text-slate-950">
            Add a course before recording rounds
          </p>
          <p className="mt-2 text-slate-600">
            Rounds must be linked to an existing course.
          </p>
          <Link
            className="mt-6 inline-flex items-center justify-center rounded-full border border-emerald-700 px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
            href="/courses/new"
          >
            Create a course
          </Link>
        </div>
      ) : null}

      <form
        className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              className="block text-sm font-semibold text-slate-900"
              htmlFor="course_id"
            >
              Course
            </label>
            <select
              aria-describedby={
                errors.course_id ? "course-id-error" : undefined
              }
              aria-invalid={Boolean(errors.course_id)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              disabled={isFormDisabled}
              id="course_id"
              name="course_id"
              onChange={(event) => updateValue("course_id", event.target.value)}
              value={values.course_id}
            >
              {isLoadingCourses ? (
                <option value="">Loading courses...</option>
              ) : (
                <>
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </>
              )}
            </select>
            {errors.course_id ? (
              <p className="mt-2 text-sm text-red-700" id="course-id-error">
                {errors.course_id}
              </p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <label
              className="block text-sm font-semibold text-slate-900"
              htmlFor="player_name"
            >
              Player name
            </label>
            <input
              aria-describedby={
                errors.player_name ? "player-name-error" : undefined
              }
              aria-invalid={Boolean(errors.player_name)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              disabled={isFormDisabled}
              id="player_name"
              name="player_name"
              onChange={(event) =>
                updateValue("player_name", event.target.value)
              }
              placeholder="Ada Lovelace"
              type="text"
              value={values.player_name}
            />
            {errors.player_name ? (
              <p className="mt-2 text-sm text-red-700" id="player-name-error">
                {errors.player_name}
              </p>
            ) : null}
          </div>

          <div>
            <label
              className="block text-sm font-semibold text-slate-900"
              htmlFor="score"
            >
              Score
            </label>
            <input
              aria-describedby={errors.score ? "score-error" : undefined}
              aria-invalid={Boolean(errors.score)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              disabled={isFormDisabled}
              id="score"
              inputMode="numeric"
              min="1"
              name="score"
              onChange={(event) => updateValue("score", event.target.value)}
              placeholder="72"
              type="number"
              value={values.score}
            />
            {errors.score ? (
              <p className="mt-2 text-sm text-red-700" id="score-error">
                {errors.score}
              </p>
            ) : null}
          </div>

          <div>
            <label
              className="block text-sm font-semibold text-slate-900"
              htmlFor="date_played"
            >
              Date played
            </label>
            <input
              aria-describedby={
                errors.date_played ? "date-played-error" : undefined
              }
              aria-invalid={Boolean(errors.date_played)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              disabled={isFormDisabled}
              id="date_played"
              name="date_played"
              onChange={(event) =>
                updateValue("date_played", event.target.value)
              }
              type="date"
              value={values.date_played}
            />
            {errors.date_played ? (
              <p className="mt-2 text-sm text-red-700" id="date-played-error">
                {errors.date_played}
              </p>
            ) : null}
          </div>
        </div>

        {submitError ? (
          <div
            className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {submitError}
          </div>
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
            href="/rounds"
          >
            Cancel
          </Link>
          <button
            className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-emerald-300"
            disabled={isFormDisabled}
            type="submit"
          >
            {isSubmitting ? "Saving round..." : "Save round"}
          </button>
        </div>
      </form>
    </section>
  );
}
