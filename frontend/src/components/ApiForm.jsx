import { useState } from 'react';
import { api } from '../lib/api.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import Icon from './Icon.jsx';

/**
 * Generic form that POSTs JSON to the NestJS API.
 * fields: [{ name, label, type='text', required, optional, textarea, options:[{value,label}], defaultValue, placeholder }]
 */
export default function ApiForm({ endpoint, fields, submitLabel, extra = {}, dark = false, successMessage, onSuccess }) {
  const { t } = useLanguage();
  const [state, setState] = useState({ status: 'idle', error: '' });

  const base = dark
    ? 'bg-white/15 border-white/30 text-white placeholder-white/50 focus:ring-blue-400'
    : 'bg-white border-slate-300 text-[#0F172A] placeholder-slate-400 focus:ring-[#2563EB]/20 focus:border-[#2563EB]';
  const input = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 ${base}`;
  const labelCls = `block text-xs font-bold mb-1 ${dark ? 'text-white' : 'text-slate-700'}`;

  const submit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setState({ status: 'sending', error: '' });
    try {
      await api.post(endpoint, { ...Object.fromEntries(new FormData(form)), ...extra });
      form.reset();
      setState({ status: 'done', error: '' });
      onSuccess?.();
    } catch (err) {
      setState({ status: 'error', error: err.message });
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 text-left">
      {fields.map((f) => (
        <div key={f.name}>
          <label className={labelCls} htmlFor={`${endpoint}-${f.name}`}>
            {f.label}{f.optional && <span className="font-normal opacity-70"> ({t('form.optional')})</span>}
          </label>
          {f.textarea ? (
            <textarea id={`${endpoint}-${f.name}`} name={f.name} rows={4} required={f.required} maxLength={3000} className={input} placeholder={f.placeholder} />
          ) : f.options ? (
            <select id={`${endpoint}-${f.name}`} name={f.name} defaultValue={f.defaultValue} className={input}>
              {f.options.map((o) => <option key={o.value} value={o.value} className="text-[#0F172A] bg-white">{o.label}</option>)}
            </select>
          ) : (
            <input
              id={`${endpoint}-${f.name}`}
              name={f.name}
              type={f.type ?? 'text'}
              required={f.required}
              min={f.type === 'number' ? 1 : undefined}
              inputMode={f.type === 'tel' ? 'tel' : undefined}
              autoComplete={f.autoComplete ?? resolveAutoComplete(f.name, f.type)}
              className={input}
              placeholder={f.placeholder}
            />
          )}
        </div>
      ))}
      <button disabled={state.status === 'sending'} type="submit"
        className={`w-full py-3 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer ${dark ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]' : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'}`}>
        <span>{state.status === 'sending' ? t('common.sending') : submitLabel}</span>
        <Icon name="arrow_forward" className="text-[18px]" />
      </button>
      {state.status === 'done' && (
        <p role="status" className={`flex items-center gap-2 text-sm font-semibold ${dark ? 'text-emerald-200' : 'text-[#0D9488]'}`}>
          <Icon name="check_circle" filled className="text-[20px]" />{successMessage ?? t('common.thanks')}
        </p>
      )}
      {state.status === 'error' && (
        <p role="alert" className={`flex items-center gap-2 text-sm font-semibold ${dark ? 'text-red-200' : 'text-red-600'}`}>
          <Icon name="error" className="text-[20px]" />{state.error || t('common.error')}
        </p>
      )}
    </form>
  );
}

function resolveAutoComplete(name, type) {
  const n = (name || '').toLowerCase();
  const t = (type || '').toLowerCase();
  if (n === 'fullname' || n === 'name') return 'name';
  if (n === 'firstname') return 'given-name';
  if (n === 'lastname') return 'family-name';
  if (n === 'email' || t === 'email') return 'email';
  if (n === 'mobile' || n === 'phone' || t === 'tel') return 'tel';
  if (n === 'place' || n === 'city') return 'address-level2';
  if (n === 'address') return 'street-address';
  if (n === 'zip' || n === 'postalcode') return 'postal-code';
  if (n === 'country') return 'country';
  if (n === 'username') return 'username';
  return undefined;
}

/** Field presets reused by several forms. */
export const useFieldSets = () => {
  const { t } = useLanguage();
  const name = { name: 'fullName', label: t('form.fullName'), required: true, autoComplete: 'name' };
  const mobile = { name: 'mobile', label: t('form.mobile'), type: 'tel', required: true, placeholder: '+91 …', autoComplete: 'tel' };
  const email = (optional) => ({ name: 'email', label: t('form.email'), type: 'email', required: !optional, optional, autoComplete: 'email' });
  return { name, mobile, email };
};
