export default function CoursesPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Courses
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Course directory
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          The frontend API client exposes <code>fetchCourses</code> and{" "}
          <code>createCourse</code> for listing and creating course records.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Course schema</h2>
        <dl className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-900">name</dt>
            <dd>Course name</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">location</dt>
            <dd>Course location</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">holes</dt>
            <dd>Number of holes</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">par</dt>
            <dd>Total course par</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
