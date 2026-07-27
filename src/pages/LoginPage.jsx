import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { ArrowLeft, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import BrandLogo from '../components/common/BrandLogo';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login');
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', full_name: '', function: '' });
  if (auth.user) return <Navigate to={location.state?.from?.pathname || '/dashboard'} replace />;
  const change = (event) => setForm((value) => ({ ...value, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    if (!auth.configured) return toast.error('Supabase is not configured. Add the required environment variables.');
    setBusy(true);
    try {
      if (mode === 'forgot') {
        const { error } = await auth.resetPassword(form.email);
        if (error) throw error;
        toast.success('If an account exists, a reset email has been sent.');
        setMode('login');
      } else if (mode === 'register') {
        const { data, error } = await auth.signUp(form.email, form.password, { full_name: form.full_name, function: form.function, role: 'viewer' });
        if (error) throw error;
        if (data.session) {
          toast.success('Account created. You are now signed in.');
          navigate('/dashboard', { replace: true });
        } else {
          toast.success('Account created. Confirm your email before signing in.');
          setMode('login');
        }
      } else {
        const { error } = await auth.signIn(form.email, form.password);
        if (error) throw error;
        navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Authentication failed', error);
      if (error?.message?.toLowerCase().includes('email not confirmed')) {
        toast.error('This account is waiting for email confirmation.');
      } else if (error?.message?.toLowerCase().includes('invalid login credentials')) {
        toast.error('No active account matches that email and password. Register first or reset your password.');
      } else if (error?.message?.toLowerCase().includes('already registered')) {
        toast.error('This email is already registered. Sign in or reset the password.');
      } else {
        toast.error('Authentication failed. Check your details and try again.');
      }
    } finally { setBusy(false); }
  };
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-navy p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-28 top-16 h-80 w-80 rounded-full border border-white/10" /><div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-brandBlue/20 blur-2xl" />
        <div className="[&_div]:text-white [&_div_div:last-child]:text-blue-200"><BrandLogo /></div>
        <div className="relative max-w-xl"><span className="text-xs font-bold uppercase tracking-[.2em] text-blue-300">HC Intelligence</span><h1 className="mt-5 text-5xl font-extrabold leading-tight">People, performance, and readiness in one workspace.</h1><p className="mt-6 leading-7 text-slate-300">Securely manage Human Capital operations and turn your organisation’s own records into actionable insight.</p></div>
        <p className="relative text-xs text-slate-400">PERTAGAS HC Operation Dashboard</p>
      </section>
      <section className="flex items-center justify-center bg-canvas px-5 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><BrandLogo /></div>
          {mode !== 'login' && <button className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-muted" onClick={() => setMode('login')}><ArrowLeft size={16} />Back to sign in</button>}
          <h2 className="text-3xl font-bold tracking-tight text-navy">{mode === 'register' ? 'Create your account' : mode === 'forgot' ? 'Reset your password' : 'Welcome back'}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{mode === 'register' ? 'New accounts begin with viewer access.' : mode === 'forgot' ? 'We will send password recovery instructions to your email.' : 'Sign in with your organisation email and password.'}</p>
          {!auth.configured && <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Supabase environment variables are missing. See <code>.env.example</code>.</div>}
          <form className="mt-7 space-y-4" onSubmit={submit}>
            {mode === 'register' && <><label><span className="field-label">Full Name *</span><input className="field" name="full_name" value={form.full_name} onChange={change} required /></label><label><span className="field-label">Function *</span><input className="field" name="function" value={form.function} onChange={change} required /></label></>}
            <label><span className="field-label">Email *</span><input className="field" name="email" type="email" value={form.email} onChange={change} required autoComplete="email" /></label>
            {mode !== 'forgot' && <label><span className="field-label">Password *</span><span className="relative block"><input className="field pr-11" name="password" type={show ? 'text' : 'password'} value={form.password} onChange={change} required minLength="8" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} /><button type="button" className="icon-btn absolute right-1 top-1/2 -translate-y-1/2" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>}
            {mode === 'login' && <div className="text-right"><button type="button" className="text-sm font-semibold text-brandBlue" onClick={() => setMode('forgot')}>Forgot password?</button></div>}
            <button className="btn-primary w-full" disabled={busy || !auth.configured}>{busy && <LoaderCircle className="animate-spin" size={17} />}{mode === 'register' ? 'Register' : mode === 'forgot' ? 'Send reset email' : 'Sign in'}</button>
          </form>
          {mode === 'login' && <p className="mt-6 text-center text-sm text-muted">Need an account? <button className="font-semibold text-brandBlue" onClick={() => setMode('register')}>Register</button></p>}
        </div>
      </section>
    </main>
  );
}
