import logo from '../../assets/company-logo.png';

export default function BrandLogo({ compact = false }) {
  return (
    <div className="inline-flex items-center rounded-xl bg-white px-3 py-2">
      <img src={logo} alt="Pertamina Gas" className="h-11 w-auto max-w-[185px] object-contain" />
      {!compact && <span className="sr-only">HC Operation Dashboard</span>}
    </div>
  );
}
