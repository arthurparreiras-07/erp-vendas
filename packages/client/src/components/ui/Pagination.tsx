interface Props {
  page: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, total, limit, onChange }: Props) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-slate-500">
      <span>{total} registros — página {page} de {totalPages}</span>
      <div className="flex gap-2">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1 border rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1 border rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
