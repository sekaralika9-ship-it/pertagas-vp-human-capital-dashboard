import { readSheet } from 'read-excel-file/browser';

const text = (value) => String(value ?? '').trim();
const normal = (value) => text(value).toLowerCase().replace(/\s+/g, ' ');
const employeeNumber = (value) => text(value).replace(/\.0$/, '');
const amount = (value) => {
  if (typeof value === 'number') return Math.max(0, value);
  const parsed = Number(text(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
};

const isoDate = (value) => {
  if (!value) return '';
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  const source = text(value);
  const match = source.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (match) return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
  const parsed = new Date(source);
  return Number.isNaN(parsed.valueOf()) ? '' : parsed.toISOString().slice(0, 10);
};

const objectsFrom = (rows, headerIndex) => {
  const headers = rows[headerIndex].map((value) => text(value));
  return rows.slice(headerIndex + 1).map((row) =>
    Object.fromEntries(headers.map((header, index) => [header || `column_${index}`, row[index]])),
  );
};

const findFile = (files, fragment) =>
  files.find((file) => normal(file.name).includes(normal(fragment)));

const trainingStatus = (value) => {
  const status = normal(value);
  if (status === 'done' || status.includes('selesai')) return 'completed';
  if (status.includes('sedang') || status.includes('proses pelatihan') || status.includes('review')) return 'ongoing';
  if (status.includes('batal')) return 'cancelled';
  return 'planned';
};

const trainingMethod = (...values) => {
  const source = normal(values.filter(Boolean).join(' '));
  if (source.includes('mobile') || source.includes('online') || source.includes('webinar')) return 'online';
  if (source.includes('blended')) return 'blended';
  if (source.includes('coaching')) return 'coaching';
  if (source.includes('sertifikasi') || source.includes('certification')) return 'certification';
  if (source.includes('workshop')) return 'workshop';
  if (source.includes('seminar')) return 'seminar';
  return 'classroom';
};

const parseEmployees = async (mainFile, realizationFile) => {
  if (!realizationFile) return [];
  const rosterRows = await readSheet(realizationFile, 'Data Pekerja');
  const roster = objectsFrom(rosterRows, 0);
  const emailByEmployee = new Map();
  if (mainFile) {
    const emailRows = await readSheet(mainFile, '1.Realisasi Pelatihan');
    objectsFrom(emailRows, 0).forEach((row) => {
      const number = employeeNumber(row['No. Pekerja']);
      if (number && row.Email) emailByEmployee.set(number, text(row.Email).toLowerCase());
    });
  }
  const seen = new Set();
  return roster.flatMap((row) => {
    const number = employeeNumber(row['No. Pekerja']);
    if (!number || !row['Nama Pekerja'] || seen.has(number)) return [];
    seen.add(number);
    return [{
      employee_number: number,
      full_name: text(row['Nama Pekerja']),
      email: emailByEmployee.get(number) || '',
      function: text(row.Fungsi) || 'Unspecified',
      department: '',
      position: text(row.Jabatan),
      grade: '',
      employment_status: 'active',
      join_date: null,
      location: text(row['Sub Area']),
      notes: '',
    }];
  });
};

const parseCatalog = async (mainFile) => {
  const catalog = new Map();
  if (!mainFile) return catalog;
  const rows = await readSheet(mainFile, '3.Nama Pelatihan');
  objectsFrom(rows, 0).forEach((row) => {
    if (!row['Nama Pelatihan']) return;
    catalog.set(normal(row['Nama Pelatihan']), {
      category: text(row['Klasifikasi Pelatihan']),
      method: trainingMethod(row['Metode Training'], row['Nama Pelatihan']),
    });
  });
  return catalog;
};

const parseTraining = async (mainFile, realizationFile) => {
  if (!realizationFile) return { records: [], warnings: [] };
  const catalog = await parseCatalog(mainFile);
  const events = new Map();
  let missingActualDates = 0;
  let invalidPlanDates = 0;
  const participantRows = await readSheet(realizationFile, 'Pretes & Post Test');
  objectsFrom(participantRows, 1).forEach((row) => {
    const title = text(row['Training Name']);
    const start = isoDate(row['Start Date']);
    const end = isoDate(row['End Date']) || start;
    if (!title) return;
    if (!start) {
      missingActualDates += 1;
      return;
    }
    const key = `${normal(title)}|${start}|${end}`;
    const item = events.get(key) || {
      training_title: title,
      category: text(row['Kategori Pelatihan']) || catalog.get(normal(title))?.category || 'Unclassified',
      provider: '',
      training_method: catalog.get(normal(title))?.method || trainingMethod(row['Educational establishment'], title),
      start_date: start,
      end_date: end,
      participant_count: 0,
      planned_cost: null,
      actual_cost: null,
      status: 'completed',
      completion_percentage: 100,
      certificate_link: '',
      notes: row['Institute/location'] ? `Location: ${text(row['Institute/location'])}` : '',
      _participants: new Set(),
    };
    item._participants.add(employeeNumber(row['No pekerja']));
    events.set(key, item);
  });

  const planRows = await readSheet(realizationFile, 'Realisasi dan Prognosa');
  objectsFrom(planRows, 2).forEach((row) => {
    const title = text(row['Nama Pelatihan']);
    const start = isoDate(row['Star Date']);
    const end = isoDate(row['End Date']) || start;
    if (!title || !start) return;
    if (end < start) {
      invalidPlanDates += 1;
      return;
    }
    const key = `${normal(title)}|${start}|${end}`;
    const status = trainingStatus(row.Proses);
    const cost = amount(row['Biaya HC']) + amount(row['Biaya Fungsi']);
    const item = events.get(key) || {
      training_title: title,
      category: text(row.Jenis) || catalog.get(normal(title))?.category || 'Unclassified',
      provider: text(row.Vendor),
      training_method: catalog.get(normal(title))?.method || trainingMethod(title, row.Tempat),
      start_date: start,
      end_date: end,
      participant_count: amount(row.Peserta),
      planned_cost: cost || null,
      actual_cost: status === 'completed' && cost ? cost : null,
      status,
      completion_percentage: status === 'completed' ? 100 : 0,
      certificate_link: '',
      notes: row.Tempat ? `Location: ${text(row.Tempat)}` : '',
      _participants: new Set(),
    };
    item.provider ||= text(row.Vendor);
    item.planned_cost ??= cost || null;
    if (status === 'completed') {
      item.status = 'completed';
      item.completion_percentage = 100;
      item.actual_cost ??= cost || null;
    }
    item.participant_count = Math.max(item.participant_count || 0, amount(row.Peserta));
    events.set(key, item);
  });

  const warnings = [];
  if (missingActualDates) warnings.push(`${missingActualDates} participant realization row was skipped because its training date is missing.`);
  if (invalidPlanDates) warnings.push(`${invalidPlanDates} planned training rows were skipped because their end dates are earlier than their start dates in the source workbook.`);
  return {
    records: [...events.values()].map(({ _participants, ...item }) => ({
      ...item,
      participant_count: Math.max(item.participant_count || 0, _participants.size),
    })),
    warnings,
  };
};

const parseTna = async (idpFile) => {
  if (!idpFile) return [];
  const rows = await readSheet(idpFile, 'Report IDP');
  const groups = new Map();
  objectsFrom(rows, 0).forEach((row) => {
    const competency = text(row.COMPETENCY_TEXT);
    const title = text(row.TITLE) || text(row.TITLE_EXECUTION);
    const fn = text(row.FUNGSI);
    const department = text(row.DEPARTEMENT);
    if (!competency || !title || !fn) return;
    const year = Number(row.PERIOD_ID) || 2026;
    const key = [year, normal(fn), normal(department), normal(competency), normal(title)].join('|');
    const priorityCode = Number(row.PRIORITY);
    const progress = normal(row['STATUS PROGRESS']);
    const status = progress === 'approve' ? 'approved' : progress === 'submit' ? 'proposed' : 'draft';
    const item = groups.get(key) || {
      year,
      function: fn,
      department,
      competency_category: competency,
      competency_gap: text(row.DESC) || competency,
      proposed_training: title,
      priority: priorityCode === 1 ? 'high' : priorityCode === 2 ? 'medium' : 'low',
      participant_count: 0,
      target_completion_date: null,
      status,
      notes: text(row.DEVELOPMENT_TYPE_NM),
      _participants: new Set(),
    };
    item._participants.add(employeeNumber(row.PERNR));
    if (status === 'approved') item.status = 'approved';
    if (priorityCode === 1) item.priority = 'high';
    groups.set(key, item);
  });
  return [...groups.values()].map(({ _participants, ...item }) => ({
    ...item,
    participant_count: _participants.size,
  }));
};

const parseBudget = async (realizationFile) => {
  if (!realizationFile) return [];
  const rows = await readSheet(realizationFile, 'Rekap Prognosa');
  const totalRow = rows.find((row) => normal(row[1]) === 'total');
  const allocationRow = rows.find((row) => normal(row[1]) === 'learning priority');
  if (!totalRow || !allocationRow) return [];
  const allocated = amount(allocationRow[8]) || amount(allocationRow[10]);
  const used = amount(totalRow[2]);
  const committed = amount(totalRow[4]);
  if (!allocated) return [];
  return [{
    year: 2026,
    budget_category: 'Training Budget',
    cost_centre: 'HC',
    programme_name: '2026 Training Programme',
    allocated_amount: allocated,
    used_amount: used,
    committed_amount: Math.min(committed, Math.max(0, allocated - used)),
    currency: 'IDR',
    notes: 'Imported from Rekap Prognosa.',
  }];
};

export async function parsePertagasWorkbooks(files) {
  const mainFile = findFile(files, 'Main Data Project Training');
  const realizationFile = findFile(files, 'Realisasi Pelatihan Januari');
  const idpFile = findFile(files, 'ReportIDP');
  const recognized = [mainFile, realizationFile, idpFile].filter(Boolean);
  if (!recognized.length) throw new Error('None of the selected workbooks match the supported Pertagas formats.');
  const [employees, trainingResult, tna, budgets] = await Promise.all([
    parseEmployees(mainFile, realizationFile),
    parseTraining(mainFile, realizationFile),
    parseTna(idpFile),
    parseBudget(realizationFile),
  ]);
  return {
    employees,
    training: trainingResult.records,
    tna,
    budgets,
    warnings: trainingResult.warnings,
    recognized: recognized.map((file) => file.name),
    ignored: files.filter((file) => !recognized.includes(file)).map((file) => file.name),
  };
}
