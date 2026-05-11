"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { fetchCourses } from "@/lib/api";
import type { Course } from "@/lib/types";

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Unable to load courses. Please try again.";
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function loadCourses() {
      setIsLoading(true);
      setError(null);

      try {
        const loadedCourses = await fetchCourses();

        if (isCurrent) {
          setCourses(loadedCourses);
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

    loadCourses();

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-5 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Courses
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Course directory
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Browse every course in your tracker, from local nine-hole loops to
            championship layouts.
          </p>
        </div>
        <Link
          className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
          href="/courses/new"
        >
          Add course
        </Link>
      </div>

      {isLoading ? (
        <div
          className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-8 text-center text-emerald-900"
          role="status"
        >
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-700" />
          <p className="mt-4 font-medium">Loading courses from the clubhouse...</p>
        </div>
      ) : error ? (
        <div
          className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-800"
          role="alert"
        >
          <h2 className="font-semibold">Could not load courses</h2>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-emerald-300 bg-white p-8 text-center">
          <p className="text-lg font-semibold text-slate-950">
            No courses yet
          </p>
          <p className="mt-2 text-slate-600">
            Add your first course to start building a playable directory.
          </p>
          <Link
            className="mt-6 inline-flex items-center justify-center rounded-full border border-emerald-700 px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
            href="/courses/new"
          >
            Create a course
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:hidden">
            {courses.map((course) => (
              <article
                className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm"
                key={course.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">
                      {course.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {course.location}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                    Par {course.par}
                  </span>
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <dt className="text-slate-500">Holes</dt>
                    <dd className="mt-1 font-semibold text-slate-950">
                      {course.holes}
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <dt className="text-slate-500">Course ID</dt>
                    <dd className="mt-1 font-semibold text-slate-950">
                      #{course.id}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm md:block">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-emerald-50">
                <tr>
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
                    Location
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-emerald-900"
                    scope="col"
                  >
                    Holes
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-emerald-900"
                    scope="col"
                  >
                    Par
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((course) => (
                  <tr className="transition hover:bg-emerald-50/50" key={course.id}>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold text-slate-950"
                      scope="row"
                    >
                      {course.name}
                    </th>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {course.location}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {course.holes}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-800">
                        {course.par}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
