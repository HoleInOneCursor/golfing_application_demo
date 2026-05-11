"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { fetchCourses, fetchRounds } from "@/lib/api";
import type { Course, Round } from "@/lib/types";

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Unable to load dashboard stats. Please try again.";
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

function sortRecentRounds(rounds: Round[]): Round[] {
  return [...rounds].sort((firstRound, secondRound) => {
    const dateComparison =
      secondRound.date_played.localeCompare(firstRound.date_played);

    return dateComparison === 0
      ? secondRound.id - firstRound.id
      : dateComparison;
  });
}

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const coursesById = useMemo(
    () => new Map(courses.map((course) => [course.id, course])),
    [courses],
  );

  const totalRounds = rounds.length;
  const averageScore =
    totalRounds === 0
      ? null
      : Math.round(
          rounds.reduce((total, round) => total + round.score, 0) /
            totalRounds,
        );
  const recentRounds = useMemo(() => sortRecentRounds(rounds).slice(0, 5), [
    rounds,
  ]);

  useEffect(() => {
    let isCurrent = true;

    async function loadDashboard() {
      setIsLoading(true);
      setError(null);

      try {
        const [loadedCourses, loadedRounds] = await Promise.all([
          fetchCourses(),
          fetchRounds(),
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

    loadDashboard();

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <section className="space-y-8">
      <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Golf dashboard
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight text-slate-950">
          Track rounds, scores, and recent play.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          See the latest activity across your course directory and scorecard
          history.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            className="rounded-full bg-emerald-700 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-800"
            href="/rounds/new"
          >
            Record a round
          </Link>
          <Link
            className="rounded-full border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
            href="/rounds"
          >
            View rounds
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div
          className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-8 text-center text-emerald-900"
          role="status"
        >
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-700" />
          <p className="mt-4 font-medium">Loading dashboard stats...</p>
        </div>
      ) : error ? (
        <div
          className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-800"
          role="alert"
        >
          <h2 className="font-semibold">Could not load dashboard</h2>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Total rounds played
              </p>
              <p className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
                {totalRounds}
              </p>
            </article>
            <article className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Average score
              </p>
              <p className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
                {averageScore ?? "--"}
              </p>
            </article>
          </div>

          <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                  Recent rounds
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  Latest scorecards
                </h2>
              </div>
              <Link
                className="text-sm font-semibold text-emerald-800 transition hover:text-emerald-900"
                href="/rounds"
              >
                See all rounds
              </Link>
            </div>

            {recentRounds.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-emerald-300 p-6 text-center">
                <p className="font-semibold text-slate-950">
                  No rounds played yet
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Record a scorecard to populate your dashboard summary.
                </p>
              </div>
            ) : (
              <div className="mt-6 divide-y divide-slate-100">
                {recentRounds.map((round) => {
                  const course = coursesById.get(round.course_id);

                  return (
                    <article
                      className="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-center"
                      key={round.id}
                    >
                      <div>
                        <h3 className="font-semibold text-slate-950">
                          {round.player_name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {course?.name ?? `Course #${round.course_id}`} on{" "}
                          {formatRoundDate(round.date_played)}
                        </p>
                      </div>
                      <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
                        Score {round.score}
                      </span>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
}
