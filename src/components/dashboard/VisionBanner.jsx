import { Sparkles } from 'lucide-react';

export default function VisionBanner({ settings }) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6 md:p-8">
      <div className="relative z-10 max-w-3xl">
        <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-brandBlue"><Sparkles size={16} />{settings?.vision_heading || 'OUR VISION'}</div>
        <h2 className="whitespace-pre-line text-2xl font-extrabold leading-tight text-navy md:text-4xl">{settings?.vision_title || 'To be a Trusted Energy Partner\nDriving Growth and Sustainability'}</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted md:text-base">{settings?.vision_description || 'Through excellence in people, process, and performance, we empower our workforce to deliver sustainable energy solutions and create value for Indonesia.'}</p>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-2/5 md:block" aria-hidden="true">
        <div className="absolute bottom-0 right-0 h-32 w-full rounded-tl-[100%] bg-navy/10" />
        <div className="absolute bottom-0 right-10 h-44 w-3/4 rounded-tl-[100%] bg-brandBlue/10" />
        <div className="absolute right-16 top-8 h-24 w-24 rounded-full bg-brandGreen/20 blur-xl" />
        <svg className="absolute bottom-6 right-10 text-navy/30" width="250" height="120" viewBox="0 0 250 120" fill="none"><path d="M10 110h230M40 110V54l24-24 24 24v56M110 110V72h34v38M175 110V38h25v72M187 38V12M175 25h25" stroke="currentColor" strokeWidth="3" /></svg>
      </div>
    </section>
  );
}
