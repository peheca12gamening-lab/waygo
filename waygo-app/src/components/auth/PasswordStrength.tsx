import { useApp } from '../../context/AppContext';

interface Props {
  strength: 'weak' | 'medium' | 'strong';
  password: string;
}

const config = {
  weak: { width: '33%', label: 'weak' as const, color: '#FF6080' },
  medium: { width: '66%', label: 'medium' as const, color: '#FFB878' },
  strong: { width: '100%', label: 'strong' as const, color: '#48C78E' },
};

const REQUIREMENTS = [
  { key: 'reqUppercase', test: (p: string) => /[A-Z]/.test(p) },
  { key: 'reqLowercase', test: (p: string) => /[a-z]/.test(p) },
  { key: 'reqNumber', test: (p: string) => /\d/.test(p) },
  { key: 'reqSpecial', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  { key: 'reqMinLength', test: (p: string) => p.length >= 8 },
] as const;

export function PasswordStrength({ strength, password }: Props) {
  const { t } = useApp();
  const current = config[strength];

  return (
    <div className="mt-2 space-y-2">
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-chip)' }}>
        <div
          className="h-full transition-all duration-300 rounded-full"
          style={{ width: current.width, background: current.color }}
        />
      </div>
      <p className="text-xs font-semibold" style={{ color: current.color }}>
        {t.passwordStrength}: {t[current.label]}
      </p>
      <div className="space-y-1">
        {REQUIREMENTS.map(({ key, test }) => {
          const met = test(password);
          return (
            <div key={key} className="flex items-center gap-1.5 text-xs">
              <span style={{ color: met ? '#48C78E' : 'var(--text-soft)' }}>
                {met ? '✓' : '○'}
              </span>
              <span style={{ color: met ? '#48C78E' : 'var(--text-soft)' }}>
                {t[key]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
