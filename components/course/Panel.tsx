export function Panel({
  title,
  extra,
  children,
}: {
  title: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-white/85 p-4 shadow-md shadow-violet-100 backdrop-blur lg:sticky lg:top-20">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-bold text-slate-800">{title}</h2>
        {extra}
      </div>
      {children}
    </div>
  );
}
