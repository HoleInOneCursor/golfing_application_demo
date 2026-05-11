"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { fetchCourses, fetchRounds } from "@/lib/api";
import type { Course, Round } from "@/lib/types";

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Unable to load rounds. Please try again.";
}

function formatRoundDate(datePlayed: string): string {
  const date = new Date(`${datePlayed}T00:00:00`);

  return Number.isNaN(date.getTime())
    ? datePlayed
    : new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
}

export default function RoundsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const coursesById = useMemo(
    () => new Map(courses.map((course) => [course.id, course])),
    [courses],
  );

  useEffect(() => {
    let isCurrent = true;
    const courseId =
      selectedCourseId === "" ? undefined : Number(selectedCourseId);

    async function loadRounds() {
      setIsLoading(true);
      setError(null);

      try {
        const [loadedCourses, loadedRounds] = await Promise.all([
          fetchCourses(),
          fetchRounds(courseId),
        ]);

        if (isCurrent) {
          setCourses(loadedCourses);
          setRounds(loadedRounds);
        }
      } catch (caughtError) {
        if (isCurrent) {
          setError(getErrorMessage(caughtError));
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadRounds();

    return () => {
      isCurrent = false;
    };
  }, [selectedCourseId]);

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-5 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Rounds
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Round log
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Review every scorecard by player, course, score, and date played.
          </p>
        </div>
        <Link
          className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
          href="/rounds/new"
        >
          Add round
        </Link>
      </div>

      <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
        <label
          className="block text-sm font-semibold text-slate-900"
          htmlFor="course-filter"
        >
          Filter by course
        </label>
        <select
          className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 sm:max-w-sm"
          disabled={isLoading && courses.length === 0}
          id="course-filter"
          onChange={(event) => setSelectedCourseId(event.target.value)}
          value={selectedCourseId}
        >
          <option value="">All courses</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div
          className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-8 text-center text-emerald-900"
          role="status"
        >
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-700" />
          <p className="mt-4 font-medium">Loading rounds from the clubhouse...</p>
        </div>
      ) : error ? (
        <div
          className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-800"
          role="alert"
        >
          <h2 className="font-semibold">Could not load rounds</h2>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      ) : rounds.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-emerald-300 bg-white p-8 text-center">
          <p className="text-lg font-semibold text-slate-950">
            No rounds recorded
          </p>
          <p className="mt-2 text-slate-600">
            {selectedCourseId
              ? "No scorecards match the selected course yet."
              : "Add your first round to start tracking scores."}
          </p>
          <Link
            className="mt-6 inline-flex items-center justify-center rounded-full border border-emerald-700 px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
            href="/rounds/new"
          >
            Record a round
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:hidden">
            {rounds.map((round) => {
              const course = coursesById.get(round.course_id);

              return (
                <article
                  className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm"
                  key={round.id}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-950">
                        {round.player_name}
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        {course?.name ?? `Course #${round.course_id}`}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
                      {round.score}
                    </span>
                  </div>
                  <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <dt className="text-slate-500">Date</dt>
                      <dd className="mt-1 font-semibold text-slate-950">
                        {formatRoundDate(round.date_played)}
                      </dd>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <dt className="text-slate-500">Round ID</dt>
                      <dd className="mt-1 font-semibold text-slate-950">
                        #{round.id}
                      </dd>
                    </div>
                  </dl>
                </article>
              );
            })}
          </div>

          <div className="hidden overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm md:block">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-emerald-50">
                <tr>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-emerald-900"
                    scope="col"
                  >
                    Player
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-emerald-900"
                    scope="col"
                  >
                    Course
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-emerald-900"
                    scope="col"
                  >
                    Score
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-emerald-900"
                    scope="col"
                  >
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rounds.map((round) => {
                  const course = coursesById.get(round.course_id);

                  return (
                    <tr
                      className="transition hover:bg-emerald-50/50"
                      key={round.id}
                    >
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-slate-950"
                        scope="row"
                      >
                        {round.player_name}
                      </th>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {course?.name ?? `Course #${round.course_id}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-800">
                          {round.score}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {formatRoundDate(round.date_played)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
