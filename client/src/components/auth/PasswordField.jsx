import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '../ui/Input.jsx';

// Password field with a show/hide toggle. Shared by login, register and the
// password-reset pages so the affordance looks the same everywhere.
export default function PasswordField({ label = 'Password', value, onChange, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      label={label}
      type={visible ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      autoComplete="current-password"
      {...props}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="grid h-9 w-9 place-items-center rounded-full text-accent-400 transition-colors hover:bg-accent-50 hover:text-ink"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
    />
  );
}
