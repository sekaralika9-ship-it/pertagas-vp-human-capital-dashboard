import logo from '../../assets/company-logo.png';

export default function BrandLogo({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      {/* Use src/assets/pertagas-logo.png here if the organisation supplies a newer official master asset. */}
      <img src={logo} alt="Pertamina Gas" className="h-11 w-auto max-w-[155px] object-contain" />
      {!compact && <span className="sr-only">HC Operation Dashboard</span>}
    </div>
  );
}
