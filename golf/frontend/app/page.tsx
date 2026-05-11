import Link from "next/link";

export default function Home() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
        Golf application
      </p>
      <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight text-slate-950">
        Manage courses and record rounds from a Next.js frontend.
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
        This App Router project is wired for the FastAPI backend through a
        configurable API client using <code>NEXT_PUBLIC_API_URL</code>.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          className="rounded-full bg-emerald-700 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-800"
          href="/courses"
        >
          View Courses
        </Link>
        <Link
          className="rounded-full border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
          href="/rounds"
        >
          View Rounds
        </Link>
      </div>
    </section>
  );
}
