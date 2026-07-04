import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileCheck2,
  FileText,
  Filter,
  FolderOpen,
  Gauge,
  GraduationCap,
  HeartHandshake,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCcw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  UsersRound,
  WalletCards,
  X,
} from 'lucide-react';
import './styles.css';

const navItems = [
  { key: 'executive', label: 'Executive Dashboard', icon: LayoutDashboard },
  { key: 'tna', label: 'TNA Dashboard', icon: Target },
  { key: 'budget', label: 'Budget Dashboard', icon: WalletCards },
  { key: 'training', label: 'Training Realization', icon: GraduationCap },
  { key: 'competency', label: 'Competency Dashboard', icon: BookOpenCheck },
  { key: 'audit', label: 'Audit Readiness', icon: ShieldCheck },
  { key: 'documents', label: 'Document Center', icon: FolderOpen },
  { key: 'reports', label: 'Reports', icon: FileText },
];

const departments = [
  { department: 'Exploration', needs: 16, completed: 15, gap: 1, employees: 286, score: 82, trend: 4 },
  { department: 'Production', needs: 17, completed: 8, gap: 9, employees: 416, score: 66, trend: -3 },
  { department: 'Drilling', needs: 8, completed: 7, gap: 1, employees: 158, score: 79, trend: 2 },
  { department: 'HSSE', needs: 13, completed: 8, gap: 5, employees: 238, score: 85, trend: 10 },
  { department: 'Finance', needs: 15, completed: 10, gap: 5, employees: 208, score: 74, trend: 5 },
  { department: 'Human Capital', needs: 9, completed: 4, gap: 5, employees: 142, score: 72, trend: 6 },
  { department: 'Supply Chain', needs: 11, completed: 10, gap: 1, employees: 176, score: 78, trend: 4 },
  { department: 'IT & Digital', needs: 17, completed: 8, gap: 9, employees: 126, score: 69, trend: -2 },
];

const monthlyTraining = [
  { month: 'Jan', planned: 110, realized: 72 },
  { month: 'Feb', planned: 225, realized: 191 },
  { month: 'Mar', planned: 176, realized: 163 },
  { month: 'Apr', planned: 223, realized: 187 },
  { month: 'May', planned: 174, realized: 128 },
  { month: 'Jun', planned: 221, realized: 202 },
  { month: 'Jul', planned: 142, realized: 96 },
  { month: 'Aug', planned: 118, realized: 112 },
  { month: 'Sep', planned: 162, realized: 104 },
  { month: 'Oct', planned: 85, realized: 64 },
  { month: 'Nov', planned: 122, realized: 82 },
  { month: 'Dec', planned: 74, realized: 42 },
];

const budgetData = [
  { quarter: 'Q1', budget: 82, actual: 66, forecast: 0 },
  { quarter: 'Q2', budget: 89, actual: 71, forecast: 0 },
  { quarter: 'Q3', budget: 81, actual: 72, forecast: 0 },
  { quarter: 'Q4', budget: 0, actual: 0, forecast: 79 },
];

const competencyData = [
  { name: 'Technical', value: 36, color: '#0f4f99' },
  { name: 'Leadership', value: 20, color: '#0f8ce8' },
  { name: 'HSSE', value: 16, color: '#14a38b' },
  { name: 'Digital', value: 14, color: '#7c4dff' },
  { name: 'Business', value: 8, color: '#f59e0b' },
  { name: 'Others', value: 6, color: '#cbd5e1' },
];

const deliveryData = [
  { name: 'Classroom', value: 26, color: '#0f4f99' },
  { name: 'Online', value: 24, color: '#0ea5e9' },
  { name: 'Hybrid', value: 20, color: '#13a389' },
  { name: 'Workshop', value: 18, color: '#f59e0b' },
  { name: 'Certification', value: 12, color: '#6d5dfc' },
];

const trainingCalendar = [
  { day: '05', mon: 'JAN', title: 'Time Management', meta: 'Engineering · 4d', type: 'Workshop', status: 'Scheduled' },
  { day: '05', mon: 'JAN', title: 'Investment Analysis', meta: 'Production · 4d', type: 'Classroom', status: 'Scheduled' },
  { day: '09', mon: 'JAN', title: 'Food Safety & Hygiene', meta: 'HSSE · 2d', type: 'Online', status: 'Completed' },
  { day: '14', mon: 'MAY', title: 'Leadership Essentials Program', meta: 'Leadership Development · Online', type: 'Online', status: 'Scheduled' },
  { day: '21', mon: 'MAY', title: 'Process Safety Management', meta: 'HSSE · Classroom', type: 'Classroom', status: 'Scheduled' },
  { day: '28', mon: 'MAY', title: 'Data Analytics for Business', meta: 'Digital & Analytics · Online', type: 'Online', status: 'Upcoming' },
];

const auditEvidence = [
  { label: 'TNA Document', value: 24, status: 'risk' },
  { label: 'RKAP Approval', value: 100, status: 'good' },
  { label: 'TOR', value: 65, status: 'warn' },
  { label: 'Invitation Letter', value: 90, status: 'good' },
  { label: 'Training Report', value: 60, status: 'warn' },
  { label: 'Participant Attendance', value: 84, status: 'good' },
];

const initiatives = [
  { title: 'Employee Assistance Program', desc: 'Counseling, wellbeing, and support services for employees.', icon: HeartHandshake, tone: 'orange' },
  { title: 'Career Development', desc: 'Structured career path and growth opportunities.', icon: BriefcaseBusiness, tone: 'green' },
  { title: 'Internal Mobility', desc: 'Internal job opportunities and development movement.', icon: UsersRound, tone: 'purple' },
  { title: 'Wellbeing Program', desc: 'Health, fitness, and workplace wellbeing initiatives.', icon: Activity, tone: 'red' },
];

const skills = [
  { role: 'Operations', technical: 84, leadership: 72, digital: 61, hsse: 90 },
  { role: 'Engineering', technical: 88, leadership: 68, digital: 72, hsse: 82 },
  { role: 'Commercial', technical: 62, leadership: 78, digital: 75, hsse: 58 },
  { role: 'Finance', technical: 74, leadership: 69, digital: 79, hsse: 52 },
  { role: 'Human Capital', technical: 66, leadership: 82, digital: 76, hsse: 60 },
];

const documents = [
  { title: 'Annual TNA Matrix FY 2024', owner: 'Learning & Development', status: 'Approved', updated: 'May 05, 2024' },
  { title: 'RKAP Training Budget Approval', owner: 'VP Human Capital', status: 'Approved', updated: 'Apr 29, 2024' },
  { title: 'Training Realization Evidence Pack', owner: 'L&D Operations', status: 'In Review', updated: 'May 01, 2024' },
  { title: 'Competency Gap Analysis', owner: 'HC Strategy', status: 'Draft', updated: 'Apr 22, 2024' },
];

function cls(...items) {
  return items.filter(Boolean).join(' ');
}

function navigate(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function usePathname() {
  const [path, setPath] = useState(window.location.pathname);
  React.useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  return path;
}

function BrandMark() {
  return (
    <div className="brand-mark" aria-label="Pertagas logo mark">
      <span className="flame flame-red" />
      <span className="flame flame-blue" />
      <span className="flame flame-green" />
    </div>
  );
}

function LoginPage() {
  return (
    <main className="login-page">
      <section className="login-hero">
        <div className="login-bg-orb orb-one" />
        <div className="login-bg-orb orb-two" />
        <div className="login-brand">
          <BrandMark />
          <div>
            <h1>PERTAGAS</h1>
            <p>VP Human Capital</p>
          </div>
        </div>
        <div className="login-copy">
          <span className="eyebrow">HC Intelligence Portal</span>
          <h2>Learning, competency, and audit readiness in one executive workspace.</h2>
          <p>
            A centralized analytics prototype for Human Capital leaders to monitor training realization,
            budget utilization, competency fulfillment, and evidence readiness.
          </p>
        </div>
        <div className="login-feature-grid">
          <div><ShieldCheck size={18} /> Audit-ready evidence</div>
          <div><Gauge size={18} /> Executive KPI tracking</div>
          <div><Sparkles size={18} /> AI-assisted insight</div>
        </div>
      </section>

      <section className="login-card">
        <div className="login-card-header">
          <h3>Welcome back</h3>
          <p>Sign in to continue to PERTAGAS VP Human Capital dashboard.</p>
        </div>
        <label>
          Email
          <input defaultValue="admin@pertagas.co.id" type="email" />
        </label>
        <label>
          Password
          <input defaultValue="pertagas-hc" type="password" />
        </label>
        <div className="login-row">
          <label className="checkbox"><input type="checkbox" defaultChecked /> Remember me</label>
          <a href="#">Forgot password?</a>
        </div>
        <button className="primary-button" onClick={() => navigate('/dashboard')}>Login as VP Human Capital</button>
        <button className="secondary-button" onClick={() => navigate('/dashboard')}>Open demo dashboard</button>
        <p className="login-note">Prototype only. No real authentication or database is connected.</p>
      </section>
    </main>
  );
}

function Sidebar({ active, setActive, collapsed, setCollapsed }) {
  return (
    <aside className={cls('sidebar', collapsed && 'collapsed')}>
      <div className="sidebar-top">
        <div className="brand-wrap">
          <BrandMark />
          {!collapsed && (
            <div>
              <div className="brand-title">PERTAGAS</div>
              <div className="brand-subtitle">VP Human Capital</div>
            </div>
          )}
        </div>
        <button className="icon-button ghost" onClick={() => setCollapsed(!collapsed)} aria-label="Collapse sidebar">
          {collapsed ? <Menu size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      <nav className="side-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.key} onClick={() => setActive(item.key)} className={cls('nav-item', active === item.key && 'active')}>
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        {!collapsed && (
          <div className="support-card">
            <div className="support-icon"><HelpCircle size={20} /></div>
            <strong>HC Helpdesk</strong>
            <p>Create a ticket or chat with HC support team.</p>
            <button>Contact Support</button>
          </div>
        )}
        <button className="nav-item muted"><Settings size={20} /> {!collapsed && <span>Settings</span>}</button>
        <button className="nav-item muted" onClick={() => navigate('/login')}><LogOut size={20} /> {!collapsed && <span>Logout</span>}</button>
      </div>
    </aside>
  );
}

function Header({ activeLabel }) {
  return (
    <header className="topbar">
      <div className="search-box">
        <Search size={18} />
        <input placeholder="Search training programs, departments, documents..." />
      </div>
      <div className="topbar-actions">
        <button className="icon-button"><RefreshCcw size={18} /></button>
        <button className="icon-button"><Download size={18} /></button>
        <button className="icon-button notification"><Bell size={18} /><span>3</span></button>
        <div className="user-chip">
          <div className="avatar">AD</div>
          <div>
            <strong>Admin</strong>
            <small>VP Human Capital</small>
          </div>
          <ChevronDown size={16} />
        </div>
      </div>
    </header>
  );
}

function PageTitle({ title, subtitle, children }) {
  return (
    <div className="page-title">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function FilterBar() {
  const filters = ['2024', 'All Directorates', 'All Functions', 'All Regions', 'All Status'];
  return (
    <div className="filter-bar">
      <div className="filter-heading"><Filter size={18} /> Global Filters</div>
      <div className="filter-grid">
        {filters.map((filter) => (
          <button key={filter} className="filter-select">{filter}<ChevronDown size={16} /></button>
        ))}
        <button className="reset-button"><RefreshCcw size={15} /> Reset</button>
      </div>
    </div>
  );
}

function KpiCard({ label, value, helper, icon: Icon, color = 'blue', trend = 'up' }) {
  return (
    <div className={cls('kpi-card', `kpi-${color}`)}>
      <div className="kpi-icon"><Icon size={22} /></div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small className={trend === 'down' ? 'negative' : 'positive'}>
          {trend === 'down' ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
          {helper}
        </small>
      </div>
    </div>
  );
}

function Card({ title, subtitle, action, children, className }) {
  return (
    <section className={cls('card', className)}>
      <div className="card-header">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action && <div className="card-action">{action}</div>}
      </div>
      {children}
    </section>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <strong>{label}</strong>
      {payload.map((item) => (
        <span key={item.dataKey}>{item.name}: {item.value}</span>
      ))}
    </div>
  );
}

function TrainingBars() {
  return (
    <ResponsiveContainer width="100%" height={235}>
      <BarChart data={monthlyTraining} barGap={4} margin={{ top: 10, right: 6, bottom: 0, left: -24 }}>
        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#d9e6f2" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar name="Planned" dataKey="planned" radius={[6, 6, 0, 0]} fill="#8cc7ff" />
        <Bar name="Realized" dataKey="realized" radius={[6, 6, 0, 0]} fill="#0f4f99" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function BudgetChart() {
  return (
    <ResponsiveContainer width="100%" height={235}>
      <BarChart data={budgetData} margin={{ top: 10, right: 10, bottom: 0, left: -24 }}>
        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#d9e6f2" />
        <XAxis dataKey="quarter" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar name="Budget" dataKey="budget" radius={[6, 6, 0, 0]} fill="#0f71dd" />
        <Bar name="Actual" dataKey="actual" radius={[6, 6, 0, 0]} fill="#13a389" />
        <Bar name="Forecast" dataKey="forecast" radius={[6, 6, 0, 0]} fill="#94a3b8" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function Donut({ data, centerValue, centerLabel }) {
  return (
    <div className="donut-wrap">
      <ResponsiveContainer width="54%" height={230}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={3}>
            {data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="donut-center">
        <strong>{centerValue}</strong>
        <span>{centerLabel}</span>
      </div>
      <div className="legend-list">
        {data.map((item) => (
          <div key={item.name}><span style={{ background: item.color }} />{item.name}<b>{item.value}%</b></div>
        ))}
      </div>
    </div>
  );
}

function CompletionGauge({ value = 25 }) {
  return (
    <div className="gauge-card">
      <div className="gauge" style={{ '--value': `${value * 1.8}deg` }}>
        <div className="gauge-mask">
          <strong>{value}%</strong>
          <span>Completion</span>
        </div>
      </div>
      <div className="gauge-footer"><span>0%</span><span>Target: 100%</span></div>
    </div>
  );
}

function DepartmentTable({ compact = false }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Department</th>
            {compact ? <><th>Employees</th><th>Fulfillment</th><th>Trend</th></> : <><th>Needs</th><th>Completed</th><th>Gap</th></>}
          </tr>
        </thead>
        <tbody>
          {departments.map((row) => (
            <tr key={row.department}>
              <td>{row.department}</td>
              {compact ? (
                <>
                  <td>{row.employees}</td>
                  <td>{row.score}%</td>
                  <td className={row.trend >= 0 ? 'positive' : 'negative'}>{row.trend >= 0 ? '+' : ''}{row.trend}%</td>
                </>
              ) : (
                <>
                  <td><span className="pill blue">{row.needs}</span></td>
                  <td><span className="pill green">{row.completed}</span></td>
                  <td><span className={cls('pill', row.gap > 5 ? 'red' : row.gap > 1 ? 'amber' : 'green')}>{row.gap}</span></td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TrainingCalendarList({ limit = 3 }) {
  return (
    <div className="calendar-list">
      {trainingCalendar.slice(0, limit).map((item, index) => (
        <div key={`${item.title}-${index}`} className={cls('calendar-item', item.status.toLowerCase())}>
          <div className="date-box"><span>{item.mon}</span><strong>{item.day}</strong></div>
          <div>
            <strong>{item.title}</strong>
            <p>{item.meta}</p>
          </div>
          <span className="tag">{item.type}</span>
        </div>
      ))}
    </div>
  );
}

function AuditStatus() {
  return (
    <div className="audit-status">
      <div className="audit-score">
        <span>Overall Audit Compliance</span>
        <strong>68%</strong>
        <p>Evidence completion status</p>
      </div>
      <div className="evidence-bars">
        {auditEvidence.slice(0, 5).map((item) => (
          <div key={item.label} className="evidence-row">
            <div className={cls('status-icon', item.status)}>{item.status === 'good' ? <CheckCircle2 size={14} /> : item.status === 'warn' ? <AlertTriangle size={14} /> : <X size={14} />}</div>
            <div className="evidence-main">
              <div><span>{item.label}</span><b>{item.value}%</b></div>
              <div className="progress-track"><span className={item.status} style={{ width: `${item.value}%` }} /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InitiativesList() {
  return (
    <div className="initiative-list">
      {initiatives.map((item) => {
        const Icon = item.icon;
        return (
          <button key={item.title} className="initiative-item">
            <span className={cls('initiative-icon', item.tone)}><Icon size={20} /></span>
            <span><strong>{item.title}</strong><small>{item.desc}</small></span>
            <ChevronRight size={18} />
          </button>
        );
      })}
    </div>
  );
}

function ExecutiveDashboard() {
  return (
    <div className="page-content">
      <PageTitle
        title="Executive Dashboard"
        subtitle="Learning & Development Analytics — FY 2024"
      >
        <div className="title-actions">
          <button className="outline-button"><Filter size={16} /> Filter</button>
          <button className="outline-button">Jan 1, 2024 - Dec 31, 2024 <CalendarDays size={16} /></button>
        </div>
      </PageTitle>

      <FilterBar />

      <div className="kpi-grid six">
        <KpiCard label="Planned Trainings" value="120" helper="+8.2% vs last year" icon={ClipboardCheck} />
        <KpiCard label="Realized Trainings" value="30" helper="+12.5% vs last year" icon={CheckCircle2} color="green" />
        <KpiCard label="TNA Fulfillment" value="25%" helper="+5.1% vs target" icon={Target} />
        <KpiCard label="Budget Utilization" value="70%" helper="-2.3% under budget" icon={WalletCards} color="purple" trend="down" />
        <KpiCard label="Total Participants" value="2,794" helper="+15.8% vs last year" icon={UsersRound} color="purple" />
        <KpiCard label="Compliance Completion" value="37%" helper="+3.4% vs target" icon={ShieldCheck} color="green" />
      </div>

      <div className="dashboard-grid top">
        <Card title="TNA Fulfillment by Department" subtitle="Training needs analysis gap">
          <DepartmentTable />
        </Card>
        <Card title="Competency Category Distribution" subtitle="Training programs by competency area">
          <Donut data={competencyData} centerValue="120" centerLabel="Programs" />
        </Card>
        <Card title="Training Delivery Method" subtitle="Distribution of delivery methods">
          <Donut data={deliveryData} centerValue="100%" centerLabel="Delivery" />
        </Card>
      </div>

      <div className="dashboard-grid bottom">
        <Card title="Training Calendar" subtitle="Upcoming and recent training activities" action={<a>View full calendar</a>}>
          <TrainingCalendarList limit={3} />
        </Card>
        <Card title="Audit Readiness" subtitle="Evidence documentation completion status" action={<a>View all evidence</a>}>
          <AuditStatus />
        </Card>
      </div>
    </div>
  );
}

function TnaDashboard() {
  return (
    <div className="page-content">
      <PageTitle title="TNA Dashboard" subtitle="Training needs analysis by department, competency, and risk gap." />
      <div className="kpi-grid four">
        <KpiCard label="Total Needs" value="106" helper="+5.2% vs last year" icon={Target} />
        <KpiCard label="Completed Needs" value="70" helper="+9.4% vs last quarter" icon={CheckCircle2} color="green" />
        <KpiCard label="Open Gap" value="36" helper="-3.1% improved" icon={AlertTriangle} color="orange" />
        <KpiCard label="High Priority" value="14" helper="Requires VP review" icon={Activity} color="red" trend="down" />
      </div>
      <div className="dashboard-grid split">
        <Card title="Department TNA Matrix" subtitle="Needs, realization, and unresolved capability gaps."><DepartmentTable /></Card>
        <Card title="Critical Gap Watchlist" subtitle="Priority gaps that may affect operational readiness.">
          <div className="watch-list">
            {departments.filter((d) => d.gap >= 5).map((d) => (
              <div key={d.department} className="watch-item">
                <span><strong>{d.department}</strong><small>{d.gap} unresolved training gaps</small></span>
                <b className={d.gap > 7 ? 'red-text' : 'amber-text'}>{d.gap > 7 ? 'High' : 'Medium'}</b>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="dashboard-grid two">
        <Card title="Competency Category Distribution" subtitle="Current demand based on TNA results."><Donut data={competencyData} centerValue="106" centerLabel="Needs" /></Card>
        <Card title="AI Recommendation" subtitle="Suggested actions for HC decision-making.">
          <div className="ai-box">
            <Sparkles size={22} />
            <p>Prioritize Production and IT & Digital programs first because both functions show the highest unresolved gap. Bundle technical, digital, and compliance modules into one quarterly learning pathway to improve completion speed.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function BudgetDashboard() {
  const budgetCards = [
    ['RKAP Budget', 'IDR 5.8B', '+2.1% approved'],
    ['Actual Spend', 'IDR 4.1B', '70% utilization'],
    ['Remaining', 'IDR 1.7B', 'Available allocation'],
    ['Cost per Participant', 'IDR 1.47M', '-4.2% efficiency'],
  ];
  return (
    <div className="page-content">
      <PageTitle title="Budget Dashboard" subtitle="Training budget utilization, actual cost, and RKAP monitoring." />
      <div className="kpi-grid four">
        {budgetCards.map((item, index) => <KpiCard key={item[0]} label={item[0]} value={item[1]} helper={item[2]} icon={[WalletCards, BarChart3, BriefcaseBusiness, TrendingUp][index]} color={index === 1 ? 'green' : index === 2 ? 'orange' : 'blue'} />)}
      </div>
      <div className="dashboard-grid two">
        <Card title="Budget RKAP vs Actual Cost" subtitle="IDR in millions — quarterly comparison."><BudgetChart /></Card>
        <Card title="Budget Utilization by Function" subtitle="Spend control by function.">
          <div className="horizontal-bars">
            {departments.slice(0, 6).map((d, i) => (
              <div key={d.department}>
                <span>{d.department}<b>{62 + i * 5}%</b></span>
                <div className="progress-track"><span className={i > 4 ? 'warn' : 'good'} style={{ width: `${62 + i * 5}%` }} /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card title="Budget Control Notes" subtitle="Executive summary for VP Human Capital.">
        <div className="note-grid">
          <div><strong>Efficiency opportunity</strong><p>Convert selected classroom programs into hybrid delivery to reduce travel and venue cost.</p></div>
          <div><strong>Risk</strong><p>Low TNA fulfillment creates potential underutilization if remaining budget is not allocated before Q4.</p></div>
          <div><strong>Action</strong><p>Approve accelerated program bundling for high-gap departments.</p></div>
        </div>
      </Card>
    </div>
  );
}

function TrainingRealization() {
  return (
    <div className="page-content">
      <PageTitle title="Training Realization" subtitle="Training plan, execution status, participant reach, and learning calendar." />
      <div className="dashboard-grid two">
        <Card title="Training Plan vs Realization" subtitle="Monthly comparison of planned vs realized programs."><TrainingBars /></Card>
        <Card title="Program Calendar" subtitle="Upcoming and completed programs."><TrainingCalendarList limit={6} /></Card>
      </div>
      <Card title="Program Portfolio" subtitle="Current learning portfolio by strategic category.">
        <div className="program-grid">
          {['Leadership Essentials', 'Process Safety Management', 'Digital Analytics', 'HR Business Partnering', 'Finance for Non-Finance', 'Audit Evidence Preparation'].map((program, i) => (
            <div className="program-card" key={program}>
              <span className="program-icon"><GraduationCap size={20} /></span>
              <strong>{program}</strong>
              <p>{['Leadership', 'HSSE', 'Digital', 'Human Capital', 'Business', 'Compliance'][i]} · {i % 2 === 0 ? 'Online' : 'Classroom'}</p>
              <div className="progress-track"><span className="good" style={{ width: `${45 + i * 8}%` }} /></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function CompetencyDashboard() {
  return (
    <div className="page-content">
      <PageTitle title="Competency Dashboard" subtitle="Competency fulfillment by function and category." />
      <div className="dashboard-grid two">
        <Card title="Competency Category Distribution" subtitle="Fulfillment by competency cluster."><Donut data={competencyData} centerValue="72%" centerLabel="Fulfillment" /></Card>
        <Card title="Department Fulfillment Overview" subtitle="Competency score by department."><DepartmentTable compact /></Card>
      </div>
      <Card title="Competency Heatmap" subtitle="Capability fulfillment by role family.">
        <div className="heatmap">
          <div className="heat-head"><span>Role Family</span><span>Technical</span><span>Leadership</span><span>Digital</span><span>HSSE</span></div>
          {skills.map((row) => (
            <div className="heat-row" key={row.role}>
              <strong>{row.role}</strong>
              {['technical', 'leadership', 'digital', 'hsse'].map((key) => (
                <span key={key} className={cls('heat-cell', row[key] >= 80 ? 'high' : row[key] >= 70 ? 'mid' : 'low')}>{row[key]}%</span>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function AuditReadiness() {
  return (
    <div className="page-content">
      <PageTitle title="Audit Readiness" subtitle="Evidence completion, compliance status, and audit documentation control." />
      <div className="kpi-grid four">
        <KpiCard label="Overall Readiness" value="84%" helper="+7.1% vs last audit" icon={ShieldCheck} color="green" />
        <KpiCard label="Evidence Complete" value="78%" helper="+6.2% this month" icon={FileCheck2} />
        <KpiCard label="Open Findings" value="12" helper="-3 resolved" icon={AlertTriangle} color="orange" />
        <KpiCard label="Policy Updated" value="90%" helper="On track" icon={ClipboardCheck} color="green" />
      </div>
      <div className="dashboard-grid two">
        <Card title="Audit Readiness Overview" subtitle="Document completion status."><AuditStatus /></Card>
        <Card title="Evidence Checklist" subtitle="Required audit evidence for L&D process.">
          <div className="check-list">
            {auditEvidence.map((item) => (
              <div key={item.label}>
                <span className={cls('status-icon', item.status)}>{item.status === 'good' ? <CheckCircle2 size={15} /> : item.status === 'warn' ? <AlertTriangle size={15} /> : <X size={15} />}</span>
                <strong>{item.label}</strong>
                <b>{item.value}%</b>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card title="Audit Action Register" subtitle="Current items requiring owner follow-up.">
        <div className="action-register">
          {['Finalize TNA approval memo', 'Upload complete attendance evidence', 'Validate TOR against RKAP reference', 'Close pending training report'].map((item, i) => (
            <div key={item}><span>{i + 1}</span><strong>{item}</strong><small>{['Human Capital', 'L&D Operations', 'Finance', 'Program Owner'][i]}</small><b>{['High', 'Medium', 'Medium', 'Low'][i]}</b></div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function DocumentCenter() {
  return (
    <div className="page-content">
      <PageTitle title="Document Center" subtitle="Centralized Human Capital documents and audit evidence repository." />
      <Card title="Document Repository" subtitle="Latest strategic and audit documents.">
        <div className="doc-list">
          {documents.map((doc) => (
            <div key={doc.title} className="doc-item">
              <div className="doc-icon"><FileText size={20} /></div>
              <div><strong>{doc.title}</strong><small>Owner: {doc.owner} · Updated: {doc.updated}</small></div>
              <span className={cls('doc-status', doc.status.toLowerCase().replace(' ', '-'))}>{doc.status}</span>
              <button className="icon-button"><Download size={17} /></button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Reports() {
  return (
    <div className="page-content">
      <PageTitle title="Reports" subtitle="Executive summaries and management reporting outputs." />
      <div className="dashboard-grid two">
        <Card title="Report Generation" subtitle="Create standard management reports.">
          <div className="report-grid">
            {['Monthly L&D Dashboard', 'TNA Gap Report', 'Budget Utilization Report', 'Audit Readiness Pack'].map((r) => (
              <button key={r} className="report-card"><FileText size={22} /><strong>{r}</strong><small>Generate PDF / Excel</small></button>
            ))}
          </div>
        </Card>
        <Card title="AI Report Brief" subtitle="Auto-generated executive narrative.">
          <div className="ai-box"><Sparkles size={22} /><p>Training realization remains below annual target, but budget utilization is controlled. The highest operational risk comes from low TNA fulfillment in Production and IT & Digital. Audit readiness is improving but TNA documentation requires urgent completion.</p></div>
        </Card>
      </div>
    </div>
  );
}

function PlaceholderPage({ active }) {
  if (active === 'tna') return <TnaDashboard />;
  if (active === 'budget') return <BudgetDashboard />;
  if (active === 'training') return <TrainingRealization />;
  if (active === 'competency') return <CompetencyDashboard />;
  if (active === 'audit') return <AuditReadiness />;
  if (active === 'documents') return <DocumentCenter />;
  if (active === 'reports') return <Reports />;
  return <ExecutiveDashboard />;
}

function AppShell() {
  const [active, setActive] = useState('executive');
  const [collapsed, setCollapsed] = useState(false);
  const activeLabel = useMemo(() => navItems.find((item) => item.key === active)?.label || 'Executive Dashboard', [active]);

  return (
    <div className="app-shell">
      <Sidebar active={active} setActive={setActive} collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className="main-area">
        <Header activeLabel={activeLabel} />
        <PlaceholderPage active={active} />
      </main>
    </div>
  );
}

function Root() {
  const path = usePathname();
  if (path === '/' || path === '/login') return <LoginPage />;
  return <AppShell />;
}

createRoot(document.getElementById('root')).render(<Root />);
