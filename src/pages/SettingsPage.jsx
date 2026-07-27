import { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { toast } from 'sonner';
import PageHeader from '../components/common/PageHeader';
import LoadingState from '../components/common/LoadingState';
import { useAuth } from '../hooks/useAuth';
import { settingsService } from '../services/settingsService';

const defaults = { application_name: 'PERTAGAS HC Operation Dashboard', organisation_name: 'PERTAMINA GAS', vision_heading: 'OUR VISION', vision_title: 'To be a Trusted Energy Partner\nDriving Growth and Sustainability', vision_description: 'Through excellence in people, process, and performance, we empower our workforce to deliver sustainable energy solutions and create value for Indonesia.', default_currency: 'IDR', default_dashboard_year: new Date().getFullYear() };
export default function SettingsPage() {
  const { role } = useAuth();
  const [settings, setSettings] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  useEffect(() => { settingsService.get().then((data) => data && setSettings(data)).catch((error) => { console.error(error); toast.error('Settings could not be loaded.'); }).finally(() => setLoading(false)); }, []);
  if (role !== 'admin') return <Navigate to="/dashboard" replace />;
  if (loading) return <LoadingState />;
  const change = (event) => setSettings((value) => ({ ...value, [event.target.name]: event.target.type === 'number' ? Number(event.target.value) : event.target.value }));
  const save = async (event) => {
    event.preventDefault(); setBusy(true);
    const { id, created_at, updated_at, ...values } = settings;
    try { setSettings(await settingsService.update(id, values)); toast.success('Application settings saved.'); }
    catch (error) { console.error(error); toast.error('Settings could not be saved. Check your permission and try again.'); }
    finally { setBusy(false); }
  };
  return (
    <>
      <PageHeader title="Settings" description="Manage organisation-wide application and dashboard defaults." />
      <form className="card max-w-4xl p-5 md:p-7" onSubmit={save}>
        <div className="grid gap-5 sm:grid-cols-2">
          <label><span className="field-label">Application Name *</span><input className="field" name="application_name" value={settings.application_name} onChange={change} required /></label>
          <label><span className="field-label">Organisation Name *</span><input className="field" name="organisation_name" value={settings.organisation_name} onChange={change} required /></label>
          <label><span className="field-label">Vision Heading *</span><input className="field" name="vision_heading" value={settings.vision_heading} onChange={change} required /></label>
          <label><span className="field-label">Default Currency *</span><input className="field" name="default_currency" value={settings.default_currency} onChange={change} required maxLength="3" /></label>
          <label className="sm:col-span-2"><span className="field-label">Vision Title *</span><textarea className="field" name="vision_title" value={settings.vision_title} onChange={change} rows="3" required /></label>
          <label className="sm:col-span-2"><span className="field-label">Vision Description *</span><textarea className="field" name="vision_description" value={settings.vision_description} onChange={change} rows="4" required /></label>
          <label><span className="field-label">Default Dashboard Year *</span><input className="field" type="number" name="default_dashboard_year" min="2000" max="2100" value={settings.default_dashboard_year} onChange={change} required /></label>
        </div>
        <div className="mt-7 border-t border-border pt-5"><button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save settings'}</button></div>
      </form>
    </>
  );
}
