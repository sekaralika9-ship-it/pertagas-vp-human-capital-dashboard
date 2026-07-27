import CrudPage from './CrudPage'; import { auditConfig } from './moduleConfigs';
export default function AuditReadinessPage() { return <CrudPage config={auditConfig} />; }
