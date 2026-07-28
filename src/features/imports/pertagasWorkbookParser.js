import { readSheet } from 'read-excel-file/browser';

const text = (value) => String(value ?? '').trim();
const normal = (value) => text(value).toLowerCase().replace(/\s+/g, ' ');
const employeeNumber = (value) => text(value).replace(/\.0$/, '');
const trainingKey = (title, start, end) => `${normal(title)}|${start}|${end}`;
const canonicalTitle = (value) => normal(value)
  .replace(/^(pelatihan|training)\s+/, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();
const titlesMatch = (left, right) => {
  const a = canonicalTitle(left);
  const b = canonicalTitle(right);
  if (!a || !b) return false;
  return a === b || (Math.min(a.length, b.length) >= 28 && (a.includes(b) || b.includes(a)));
};
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
  const match = source.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{3,4})$/);
  if (match) {
    const year = match[3].length === 3 && match[3].startsWith('2')
      ? `20${match[3].slice(1)}`
      : match[3];
    return `${year}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
  }
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
  let mainRoster = [];
  if (mainFile) {
    const emailRows = await readSheet(mainFile, '1.Realisasi Pelatihan');
    mainRoster = objectsFrom(emailRows, 0);
    mainRoster.forEach((row) => {
      const number = employeeNumber(row['No. Pekerja']);
      if (number && row.Email) emailByEmployee.set(number, text(row.Email).toLowerCase());
    });
  }
  const participantRows = await readSheet(realizationFile, 'Pretes & Post Test');
  const participatingEmployees = new Set(
    objectsFrom(participantRows, 1).map((row) => employeeNumber(row['No pekerja'])).filter(Boolean),
  );
  const seen = new Set();
  const employees = roster.flatMap((row) => {
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
  mainRoster.forEach((row) => {
    const number = employeeNumber(row['No. Pekerja']);
    if (!number || !participatingEmployees.has(number) || seen.has(number)) return;
    seen.add(number);
    employees.push({
      employee_number: number,
      full_name: text(row['Nama Pekerja']),
      email: text(row.Email).toLowerCase(),
      function: text(row['Direktorat/ Fungsi']) || 'Unspecified',
      department: '',
      position: text(row.Jabatan),
      grade: '',
      employment_status: 'active',
      join_date: null,
      location: text(row['Sub Area']),
      notes: '',
    });
  });
  return employees;
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

const parseTraining = async (mainFile, realizationFile, idpFile) => {
  if (!realizationFile) return { records: [], participations: [], warnings: [] };
  const catalog = await parseCatalog(mainFile);
  const events = new Map();
  const participations = [];
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
    const key = trainingKey(title, start, end);
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
      owner_function: 'Unspecified',
      hc_cost: 0,
      function_cost: 0,
      tna_based: false,
      status: 'completed',
      completion_percentage: 100,
      certificate_link: '',
      notes: row['Institute/location'] ? `Location: ${text(row['Institute/location'])}` : '',
      _participants: new Set(),
    };
    const number = employeeNumber(row['No pekerja']);
    if (number) {
      item._participants.add(number);
      participations.push({
        employee_number: number,
        training_key: key,
        pre_test_score: row['Pre Test'] === null || row['Pre Test'] === undefined ? null : amount(row['Pre Test']),
        post_test_score: row['Post Test'] === null || row['Post Test'] === undefined ? null : amount(row['Post Test']),
        result: text(row.Result),
      });
    }
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
    const key = trainingKey(title, start, end);
    const status = trainingStatus(row.Proses);
    const hcCost = amount(row['Biaya HC']);
    const functionCost = amount(row['Biaya Fungsi']);
    const cost = hcCost + functionCost;
    const ownerFunction = text(row.Anggaran) || 'Unspecified';
    const tnaBased = normal(row.Jenis).includes('learning priority');
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
      owner_function: ownerFunction,
      hc_cost: hcCost,
      function_cost: functionCost,
      tna_based: tnaBased,
      status,
      completion_percentage: status === 'completed' ? 100 : 0,
      certificate_link: '',
      notes: row.Tempat ? `Location: ${text(row.Tempat)}` : '',
      _participants: new Set(),
    };
    item.provider ||= text(row.Vendor);
    item.owner_function = ownerFunction;
    item.hc_cost = Math.max(item.hc_cost || 0, hcCost);
    item.function_cost = Math.max(item.function_cost || 0, functionCost);
    item.tna_based ||= tnaBased;
    item.planned_cost ??= cost || null;
    if (status === 'completed') {
      item.status = 'completed';
      item.completion_percentage = 100;
      item.actual_cost ??= cost || null;
    }
    item.participant_count = Math.max(item.participant_count || 0, amount(row.Peserta));
    events.set(key, item);
  });

  if (idpFile) {
    const actualRows = await readSheet(idpFile, 'Data Pelatihan 2026');
    objectsFrom(actualRows, 0).forEach((row) => {
      const title = text(row['Nama Pelatihan']);
      const start = isoDate(row['Star Date']);
      const end = isoDate(row['End Date']) || start;
      if (!title || !start || end < start) return;
      const key = trainingKey(title, start, end);
      const hcCost = amount(row['Biaya HC']);
      const functionCost = amount(row['Biaya Fungsi']);
      const cost = hcCost + functionCost;
      const realizedParticipants = amount(row.Realisasi);
      const status = trainingStatus(row.Proses) === 'completed' || realizedParticipants > 0 ? 'completed' : trainingStatus(row.Proses);
      const ownerFunction = text(row.Anggaran) || 'Unspecified';
      const tnaBased = normal(row.Jenis).includes('learning priority');
      const item = events.get(key) || {
        training_title: title,
        category: text(row.Jenis) || catalog.get(normal(title))?.category || 'Unclassified',
        provider: text(row.Vendor),
        training_method: catalog.get(normal(title))?.method || trainingMethod(title, row.Tempat),
        start_date: start,
        end_date: end,
        participant_count: realizedParticipants || amount(row['Peserta Sign IDP']),
        planned_cost: cost || null,
        actual_cost: status === 'completed' && cost ? cost : null,
        owner_function: ownerFunction,
        hc_cost: hcCost,
        function_cost: functionCost,
        tna_based: tnaBased,
        status,
        completion_percentage: status === 'completed' ? 100 : 0,
        certificate_link: '',
        notes: row.Tempat ? `Location: ${text(row.Tempat)}` : '',
        _participants: new Set(),
      };
      item.provider ||= text(row.Vendor);
      item.owner_function = ownerFunction;
      item.hc_cost = Math.max(item.hc_cost || 0, hcCost);
      item.function_cost = Math.max(item.function_cost || 0, functionCost);
      item.tna_based ||= tnaBased;
      item.participant_count = Math.max(item.participant_count || 0, realizedParticipants);
      item.planned_cost ??= cost || null;
      if (status === 'completed') {
        item.status = 'completed';
        item.completion_percentage = 100;
        item.actual_cost = cost || item.actual_cost;
      }
      events.set(key, item);
    });
  }

  const warnings = [];
  if (missingActualDates) warnings.push(`${missingActualDates} participant realization row was skipped because its training date is missing.`);
  if (invalidPlanDates) warnings.push(`${invalidPlanDates} planned training rows were skipped because their end dates are earlier than their start dates in the source workbook.`);
  const uniqueParticipations = new Map();
  participations.forEach((participation) => {
    uniqueParticipations.set(
      `${participation.employee_number}|${participation.training_key}`,
      participation,
    );
  });
  return {
    records: [...events.values()].map(({ _participants, ...item }) => ({
      ...item,
      participant_count: Math.max(item.participant_count || 0, _participants.size),
    })),
    participations: [...uniqueParticipations.values()],
    warnings,
  };
};

const completedTnaTitles = async (realizationFile) => {
  if (!realizationFile) return [];
  const rows = await readSheet(realizationFile, 'Realisasi dan Prognosa');
  return objectsFrom(rows, 2)
    .filter((row) => normal(row.Jenis).includes('learning priority') && trainingStatus(row.Proses) === 'completed')
    .map((row) => text(row['Nama Pelatihan']))
    .filter(Boolean);
};

const parseTna = async (idpFile, realizationFile) => {
  if (!idpFile) return [];
  const completedTitles = await completedTnaTitles(realizationFile);
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
    const completed = completedTitles.some((completedTitle) => titlesMatch(title, completedTitle));
    const status = completed ? 'completed' : progress === 'approve' ? 'approved' : progress === 'submit' ? 'proposed' : 'draft';
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
    if (status === 'completed') item.status = 'completed';
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
    parseTraining(mainFile, realizationFile, idpFile),
    parseTna(idpFile, realizationFile),
    parseBudget(realizationFile),
  ]);
  const warnings = [...trainingResult.warnings];
  const detailedUsed = trainingResult.records
    .filter((record) => record.status === 'completed')
    .reduce((total, record) => total + Number(record.actual_cost || 0), 0);
  const recapUsed = Number(budgets[0]?.used_amount || 0);
  if (detailedUsed && recapUsed && Math.abs(detailedUsed - recapUsed) >= 1) {
    warnings.push(
      `Detailed completed-training costs differ from the Rekap Prognosa used-budget total by IDR ${Math.abs(detailedUsed - recapUsed).toLocaleString('id-ID')}. Verify the source workbooks before financial reporting.`,
    );
  }
  return {
    employees,
    training: trainingResult.records,
    participations: trainingResult.participations,
    tna,
    budgets,
    warnings,
    recognized: recognized.map((file) => file.name),
    ignored: files.filter((file) => !recognized.includes(file)).map((file) => file.name),
  };
}
