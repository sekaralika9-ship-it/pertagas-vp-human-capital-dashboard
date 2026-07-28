import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { calculateRemainingBudget } from '../../lib/calculations';

const fieldSchema = (field) => {
  if (field.type === 'boolean') return z.union([z.boolean(), z.enum(['true', 'false'])]);
  if (field.type === 'number') {
    let schema = z.coerce.number({ error: 'Enter a valid number' });
    if (field.min !== undefined) schema = schema.min(field.min, `Minimum is ${field.min}`);
    if (field.max !== undefined) schema = schema.max(field.max, `Maximum is ${field.max}`);
    return field.required ? schema : z.union([z.literal(''), schema]).optional();
  }
  if (field.type === 'url') {
    const schema = z.string().url('Enter a valid URL');
    return field.required ? schema : z.union([z.literal(''), schema]).optional();
  }
  if (field.type === 'email') {
    const schema = z.string().email('Enter a valid email address');
    return field.required ? schema : z.union([z.literal(''), schema]).optional();
  }
  const schema = z.string().trim();
  return field.required ? schema.min(1, `${field.label} is required`) : schema.optional();
};

export default function RecordForm({ fields, record, busy, onCancel, onSubmit }) {
  const schema = z.object(Object.fromEntries(fields.filter((field) => !field.computed).map((field) => [field.name, fieldSchema(field)])));
  const defaults = Object.fromEntries(fields.map((field) => [field.name, record?.[field.name] ?? field.defaultValue ?? '']));
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: defaults });
  useEffect(() => reset(defaults), [record]); // eslint-disable-line react-hooks/exhaustive-deps
  const allocated = watch('allocated_amount');
  const used = watch('used_amount');
  const committed = watch('committed_amount');

  const submit = (values) => {
    const payload = { ...values };
    fields.filter((field) => field.type === 'number').forEach((field) => {
      if (payload[field.name] === '') payload[field.name] = null;
    });
    fields.filter((field) => field.type === 'boolean').forEach((field) => {
      payload[field.name] = payload[field.name] === true || payload[field.name] === 'true';
    });
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="p-5 sm:p-7">
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((field) => {
          const error = errors[field.name]?.message;
          const common = { id: field.name, className: 'field', ...register(field.name) };
          if (field.computed) common.value = calculateRemainingBudget(allocated, used, committed);
          return (
            <label key={field.name} className={field.full ? 'sm:col-span-2' : ''}>
              <span className="field-label">{field.label}{field.required && <span className="text-brandRed"> *</span>}</span>
              {field.options ? (
                <select {...common} disabled={field.computed}>
                  <option value="">Select {field.label.toLowerCase()}</option>
                  {field.options.map((option) => {
                    const value = typeof option === 'object' ? option.value : option;
                    const label = typeof option === 'object' ? option.label : option.replaceAll('_', ' ');
                    return <option key={value} value={value}>{label}</option>;
                  })}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea {...common} rows="4" />
              ) : (
                <input {...common} type={field.type || 'text'} min={field.min} max={field.max} step={field.step} disabled={field.computed} />
              )}
              {error && <span className="mt-1 block text-xs text-brandRed">{error}</span>}
            </label>
          );
        })}
      </div>
      <div className="mt-8 flex justify-end gap-3 border-t border-border pt-5">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : record ? 'Save changes' : 'Add record'}</button>
      </div>
    </form>
  );
}
