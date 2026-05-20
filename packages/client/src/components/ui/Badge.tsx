import clsx from 'clsx';

interface Props {
  label: string;
  color: 'green' | 'yellow' | 'red' | 'blue' | 'slate';
}

const colors = {
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
  slate: 'bg-slate-100 text-slate-700',
};

export function Badge({ label, color }: Props) {
  return (
    <span className={clsx('inline-block px-2 py-0.5 text-xs font-medium rounded-full', colors[color])}>
      {label}
    </span>
  );
}
