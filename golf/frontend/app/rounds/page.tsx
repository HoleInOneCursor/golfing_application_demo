export default function RoundsPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Rounds
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Round log
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          The frontend API client exposes <code>fetchRounds</code> and{" "}
          <code>createRound</code> for listing and creating score records.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Round schema</h2>
        <dl className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-900">course_id</dt>
            <dd>Linked course identifier</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">player_name</dt>
            <dd>Player name</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">score</dt>
            <dd>Total strokes</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">date_played</dt>
            <dd>ISO date string from the backend</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
