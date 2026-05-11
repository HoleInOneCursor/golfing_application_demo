"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { createCourse } from "@/lib/api";
import type { CourseCreate } from "@/lib/types";

type CourseFormValues = {
  name: string;
  location: string;
  holes: string;
  par: string;
};

type CourseFormErrors = Partial<Record<keyof CourseFormValues, string>>;

const initialValues: CourseFormValues = {
  name: "",
  location: "",
  holes: "18",
  par: "72",
};

function parsePositiveInteger(value: string): number | null {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function validateCourse(values: CourseFormValues): {
  course: CourseCreate | null;
  errors: CourseFormErrors;
} {
  const errors: CourseFormErrors = {};
  const trimmedName = values.name.trim();
  const trimmedLocation = values.location.trim();
  const holes = parsePositiveInteger(values.holes);
  const par = parsePositiveInteger(values.par);

  if (!trimmedName) {
    errors.name = "Enter a course name.";
  }

  if (!trimmedLocation) {
    errors.location = "Enter a course location.";
  }

  if (holes === null) {
    errors.holes = "Enter a whole number of holes.";
  } else if (holes > 36) {
    errors.holes = "Courses cannot have more than 36 holes.";
  }

  if (par === null) {
    errors.par = "Enter a whole number for par.";
  } else if (par > 200) {
    errors.par = "Par must be 200 or less.";
  }

  if (Object.keys(errors).length > 0 || holes === null || par === null) {
    return { course: null, errors };
  }

  return {
    course: {
      name: trimmedName,
      location: trimmedLocation,
      holes,
      par,
    },
    errors,
  };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Unable to create the course. Please try again.";
}

export default function NewCoursePage() {
  const router = useRouter();
  const [values, setValues] = useState<CourseFormValues>(initialValues);
  const [errors, setErrors] = useState<CourseFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateValue(field: keyof CourseFormValues, value: string) {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const validation = validateCourse(values);
    setErrors(validation.errors);

    if (!validation.course) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createCourse(validation.course);
      router.push("/courses");
    } catch (caughtError) {
      setSubmitError(getErrorMessage(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-8">
      <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          New course
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Add a course to the directory
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Capture the basic scorecard details so future rounds can be tied to
          the right fairways and greens.
        </p>
      </div>

      <form
        className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              className="block text-sm font-semibold text-slate-900"
              htmlFor="name"
            >
              Course name
            </label>
            <input
              aria-describedby={errors.name ? "name-error" : undefined}
              aria-invalid={Boolean(errors.name)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
              disabled={isSubmitting}
              id="name"
              name="name"
              onChange={(event) => updateValue("name", event.target.value)}
              placeholder="Pebble Beach Golf Links"
              type="text"
              value={values.name}
            />
            {errors.name ? (
              <p className="mt-2 text-sm text-red-700" id="name-error">
                {errors.name}
              </p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <label
              className="block text-sm font-semibold text-slate-900"
              htmlFor="location"
            >
              Location
            </label>
            <input
              aria-describedby={
                errors.location ? "location-error" : undefined
              }
              aria-invalid={Boolean(errors.location)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
              disabled={isSubmitting}
              id="location"
              name="location"
              onChange={(event) => updateValue("location", event.target.value)}
              placeholder="Pebble Beach, CA"
              type="text"
              value={values.location}
            />
            {errors.location ? (
              <p className="mt-2 text-sm text-red-700" id="location-error">
                {errors.location}
              </p>
            ) : null}
          </div>

          <div>
            <label
              className="block text-sm font-semibold text-slate-900"
              htmlFor="holes"
            >
              Holes
            </label>
            <input
              aria-describedby={errors.holes ? "holes-error" : undefined}
              aria-invalid={Boolean(errors.holes)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
              disabled={isSubmitting}
              id="holes"
              inputMode="numeric"
              min="1"
              name="holes"
              onChange={(event) => updateValue("holes", event.target.value)}
              placeholder="18"
              type="number"
              value={values.holes}
            />
            {errors.holes ? (
              <p className="mt-2 text-sm text-red-700" id="holes-error">
                {errors.holes}
              </p>
            ) : null}
          </div>

          <div>
            <label
              className="block text-sm font-semibold text-slate-900"
              htmlFor="par"
            >
              Par
            </label>
            <input
              aria-describedby={errors.par ? "par-error" : undefined}
              aria-invalid={Boolean(errors.par)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
              disabled={isSubmitting}
              id="par"
              inputMode="numeric"
              min="1"
              name="par"
              onChange={(event) => updateValue("par", event.target.value)}
              placeholder="72"
              type="number"
              value={values.par}
            />
            {errors.par ? (
              <p className="mt-2 text-sm text-red-700" id="par-error">
                {errors.par}
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
            href="/courses"
          >
            Cancel
          </Link>
          <button
            className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-emerald-300"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Saving course..." : "Save course"}
          </button>
        </div>
      </form>
    </section>
  );
}
