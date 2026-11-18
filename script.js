// --- 1. INITIAL MOCK DATABASE ---
const DEPT_CODES = {
  'General Medicine': 'GM',
  'Cardiology': 'CD',
  'Orthopedics': 'OR',
  'Pediatrics': 'PD',
  'Dermatology': 'DM'
};

let tokenCounters = {
  'General Medicine': 102,
  'Cardiology': 102,
  'Orthopedics': 102,
  'Pediatrics': 101,
  'Dermatology': 101
};

let patients = [
  {
    id: 'PAT-1001',
    name: 'Rohan Verma',
    age: 42,
    gender: 'Male',
    phone: '+91 98112 34510',
    blood: 'B+',
    allergies: 'Penicillin, Aspirin',
    history: [
      {
        date: '2026-10-12',
        dept: 'General Medicine',
        diagnosis: 'Seasonal Viral Fever',
        prescription: 'Paracetamol 650mg SOS, Cetirizine 10mg HS for 5 days, Warm saline gargles.',
        vitals: 'BP: 122/80 | Temp: 100.4°F | Pulse: 84 bpm'
      }
    ]
  },
  {
    id: 'PAT-1002',
    name: 'Meera Nair',
    age: 29,
    gender: 'Female',
    phone: '+91 98204 77891',
    blood: 'O+',
    allergies: '',
    history: [
      {
        date: '2026-09-20',
        dept: 'Cardiology',
        diagnosis: 'Mild Sinus Tachycardia (Stress-induced)',
        prescription: 'Hydration therapy, Reduce caffeine intake, Follow-up ECG in 2 months.',
        vitals: 'BP: 118/76 | Temp: 98.4°F | Pulse: 96 bpm'
      }
    ]
  },
  {
    id: 'PAT-1003',
    name: 'Kabir Mehta',
    age: 61,
    gender: 'Male',
    phone: '+91 99100 65432',
    blood: 'A+',
    allergies: 'Sulfa Drugs',
    history: [
      {
        date: '2026-11-01',
        dept: 'Orthopedics',
        diagnosis: 'Early Osteoarthritis - Right Knee',
        prescription: 'Physiotherapy quadriceps strengthening, Calcium + Vit D3 supplement.',
        vitals: 'BP: 134/84 | Temp: 98.6°F | Pulse: 74 bpm'
      }
    ]
  }
];

let queue = [
  {
    token: 'GM-101',
    patientId: 'PAT-1001',
    dept: 'General Medicine',
    vitals: { bp: '124/82', temp: '99.8', pulse: '82' },
    symptoms: 'Persistent dry cough and mild throat irritation for 3 days.',
    status: 'serving', // 'waiting' | 'serving' | 'completed'
    checkInTime: '09:15 PM'
  },
  {
    token: 'CD-101',
    patientId: 'PAT-1002',
    dept: 'Cardiology',
    vitals: { bp: '116/74', temp: '98.5', pulse: '78' },
    symptoms: 'Routine follow-up review for palpitations.',
    status: 'waiting',
    checkInTime: '09:28 PM'
  },
  {
    token: 'OR-101',
    patientId: 'PAT-1003',
    dept: 'Orthopedics',
    vitals: { bp: '130/80', temp: '98.6', pulse: '72' },
    symptoms: 'Right knee stiffness while climbing stairs.',
    status: 'waiting',
    checkInTime: '09:35 PM'
  }
];

let followUps = [
  {
    id: 'FU-1',
    patientId: 'PAT-1002',
    dept: 'Cardiology',
    date: '2026-11-20',
    note: 'Repeat 12-Lead ECG & Pulse evaluation',
    status: 'Scheduled'
  },
  {
    id: 'FU-2',
    patientId: 'PAT-1003',
    dept: 'Orthopedics',
    date: '2026-11-25',
    note: 'Assess physiotherapy progress for right knee',
    status: 'Scheduled'
  }
];

let regMode = 'new';

// --- 2. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  refreshAllViews();
});

function refreshAllViews() {
  populateExistingPatientDropdown();
  renderQueue();
  renderDoctorDashboard();
  renderPatientsDirectory();
  renderFollowUps();
  updateBadges();
}

function updateBadges() {
  const activeCount = queue.filter(q => q.status !== 'completed').length;
  document.getElementById('queue-badge').textContent = activeCount;

  const pendingFollowUps = followUps.filter(f => f.status === 'Scheduled').length;
  document.getElementById('followup-badge').textContent = pendingFollowUps;
}

// --- 3. TAB NAVIGATION ---
function switchTab(tabName) {
  document.querySelectorAll('.tab-view').forEach(el => el.classList.add('hidden'));
  document.getElementById(`view-${tabName}`).classList.remove('hidden');

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('border-teal-600', 'text-teal-600');
    btn.classList.add('border-transparent', 'text-slate-500');
  });

  const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
  if (activeBtn) {
    activeBtn.classList.remove('border-transparent', 'text-slate-500');
    activeBtn.classList.add('border-teal-600', 'text-teal-600');
  }

  refreshAllViews();
  lucide.createIcons();
}

// --- 4. RECEPTION & PATIENT CHECK-IN ---
function setRegMode(mode) {
  regMode = mode;
  const newBtn = document.getElementById('btn-mode-new');
  const extBtn = document.getElementById('btn-mode-existing');
  const extBox = document.getElementById('existing-patient-box');

  if (mode === 'new') {
    newBtn.classList.add('bg-white', 'text-slate-900', 'shadow-sm');
    newBtn.classList.remove('text-slate-600');
    extBtn.classList.remove('bg-white', 'text-slate-900', 'shadow-sm');
    extBtn.classList.add('text-slate-600');
    extBox.classList.add('hidden');
    clearRegistrationFields();
  } else {
    extBtn.classList.add('bg-white', 'text-slate-900', 'shadow-sm');
    extBtn.classList.remove('text-slate-600');
    newBtn.classList.remove('bg-white', 'text-slate-900', 'shadow-sm');
    newBtn.classList.add('text-slate-600');
    extBox.classList.remove('hidden');
  }
}

function populateExistingPatientDropdown() {
  const select = document.getElementById('existing-patient-select');
  const currentVal = select.value;
  select.innerHTML = '<option value="">-- Choose a patient --</option>';
  patients.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.name} (${p.id}) — ${p.phone}`;
    select.appendChild(opt);
  });
  select.value = currentVal;
}

function populateExistingPatient() {
  const pid = document.getElementById('existing-patient-select').value;
  const p = patients.find(item => item.id === pid);
  if (!p) return;

  document.getElementById('reg-name').value = p.name;
  document.getElementById('reg-age').value = p.age;
  document.getElementById('reg-gender').value = p.gender;
  document.getElementById('reg-phone').value = p.phone;
  document.getElementById('reg-blood').value = p.blood;
  document.getElementById('reg-allergies').value = p.allergies || '';
}

function clearRegistrationFields() {
  document.getElementById('existing-patient-select').value = '';
  document.getElementById('reg-name').value = '';
  document.getElementById('reg-age').value = '';
  document.getElementById('reg-phone').value = '';
  document.getElementById('reg-allergies').value = '';
  document.getElementById('reg-bp').value = '';
  document.getElementById('reg-temp').value = '';
  document.getElementById('reg-pulse').value = '';
  document.getElementById('reg-symptoms').value = '';
}

function handleCheckInSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('reg-name').value.trim();
  const age = parseInt(document.getElementById('reg-age').value, 10);
  const gender = document.getElementById('reg-gender').value;
  const phone = document.getElementById('reg-phone').value.trim();
  const blood = document.getElementById('reg-blood').value;
  const dept = document.getElementById('reg-dept').value;
  const allergies = document.getElementById('reg-allergies').value.trim();

  const bp = document.getElementById('reg-bp').value.trim() || '120/80';
  const temp = document.getElementById('reg-temp').value.trim() || '98.6';
  const pulse = document.getElementById('reg-pulse').value.trim() || '76';
  const symptoms = document.getElementById('reg-symptoms').value.trim();

  let patientRecord;

  if (regMode === 'existing' && document.getElementById('existing-patient-select').value) {
    const pid = document.getElementById('existing-patient-select').value;
    patientRecord = patients.find(p => p.id === pid);
    if (patientRecord) {
      patientRecord.name = name;
      patientRecord.age = age;
      patientRecord.gender = gender;
      patientRecord.phone = phone;
      patientRecord.blood = blood;
      patientRecord.allergies = allergies;
    }
  } else {
    const newId = `PAT-${1000 + patients.length + 1}`;
    patientRecord = {
      id: newId,
      name,
      age,
      gender,
      phone,
      blood,
      allergies,
      history: []
    };
    patients.push(patientRecord);
  }

  // Generate OPD Token
  const deptPrefix = DEPT_CODES[dept] || 'OP';
  const tokenNumber = `${deptPrefix}-${tokenCounters[dept]++}`;
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const newQueueEntry = {
    token: tokenNumber,
    patientId: patientRecord.id,
    dept,
    vitals: { bp, temp, pulse },
    symptoms,
    status: 'waiting',
    checkInTime: timeStr
  };

  queue.push(newQueueEntry);

  // Render Token Slip
  document.getElementById('empty-token-placeholder').classList.add('hidden');
  document.getElementById('printable-token-slip').classList.remove('hidden');

  document.getElementById('slip-token').textContent = tokenNumber;
  document.getElementById('slip-timestamp').textContent = `${dateStr}, ${timeStr}`;
  document.getElementById('slip-dept').textContent = dept;
  document.getElementById('slip-pid').textContent = `ID: ${patientRecord.id}`;
  document.getElementById('slip-name').textContent = patientRecord.name;
  document.getElementById('slip-demo').textContent = `${patientRecord.age} yrs / ${patientRecord.gender} / ${patientRecord.blood}`;
  document.getElementById('slip-vitals').textContent = `BP ${bp} • ${temp}°F • ${pulse} bpm`;

  const allergyBox = document.getElementById('slip-allergy-box');
  if (patientRecord.allergies) {
    allergyBox.classList.remove('hidden');
    document.getElementById('slip-allergy-text').textContent = patientRecord.allergies;
  } else {
    allergyBox.classList.add('hidden');
  }

  // Generate QR Code URL via Public QR API
  const qrPayload = encodeURIComponent(`MEDCORE|${patientRecord.id}|${tokenNumber}|${patientRecord.name}`);
  document.getElementById('slip-qr-img').src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${qrPayload}`;

  clearRegistrationFields();
  setRegMode('new');
  refreshAllViews();
  lucide.createIcons();
}

// --- 5. LIVE QUEUE BOARD ---
function renderQueue() {
  const filterDept = document.getElementById('queue-dept-filter').value;
  const filtered = filterDept === 'ALL' ? queue : queue.filter(q => q.dept === filterDept);

  const serving = filtered.filter(q => q.status === 'serving');
  const waiting = filtered.filter(q => q.status === 'waiting');
  const completed = filtered.filter(q => q.status === 'completed');

  document.getElementById('count-serving').textContent = serving.length;
  document.getElementById('count-waiting').textContent = waiting.length;
  document.getElementById('count-completed').textContent = completed.length;

  document.getElementById('list-serving').innerHTML = serving.length
    ? serving.map(item => buildQueueCard(item, 'serving')).join('')
    : '<p class="text-xs text-emerald-700/70 italic py-4 text-center">No patient currently inside cabin</p>';

  document.getElementById('list-waiting').innerHTML = waiting.length
    ? waiting.map(item => buildQueueCard(item, 'waiting')).join('')
    : '<p class="text-xs text-amber-700/70 italic py-4 text-center">No patients waiting</p>';

  document.getElementById('list-completed').innerHTML = completed.length
    ? completed.map(item => buildQueueCard(item, 'completed')).join('')
    : '<p class="text-xs text-slate-400 italic py-4 text-center">No completed visits yet</p>';

  lucide.createIcons();
}

function buildQueueCard(item, type) {
  const patient = patients.find(p => p.id === item.patientId) || { name: 'Unknown', allergies: '' };
  const allergyTag = patient.allergies
    ? `<div class="mt-2 inline-flex items-center gap-1 bg-red-100 text-red-800 text-[11px] font-bold px-2 py-0.5 rounded">
         <i data-lucide="alert-triangle" class="w-3 h-3"></i> Allergy: ${patient.allergies}
       </div>`
    : '';

  let actionBtn = '';
  if (type === 'waiting') {
    actionBtn = `
      <button onclick="callPatientToCabin('${item.token}')" class="mt-3 w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition flex items-center justify-center gap-1.5">
        <i data-lucide="bell-ring" class="w-3.5 h-3.5"></i> Call to Doctor
      </button>`;
  } else if (type === 'serving') {
    actionBtn = `
      <button onclick="openInDoctorView('${item.dept}')" class="mt-3 w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold py-2 px-3 rounded-lg transition flex items-center justify-center gap-1.5">
        <i data-lucide="stethoscope" class="w-3.5 h-3.5"></i> Open Doctor Chart
      </button>`;
  }

  return `
    <div class="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
      <div class="flex justify-between items-start">
        <span class="font-extrabold text-sm text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md">${item.token}</span>
        <span class="text-[11px] font-medium text-slate-500">${item.dept}</span>
      </div>
      <p class="font-bold text-slate-900 text-sm mt-2">${patient.name} <span class="text-xs font-normal text-slate-400">(${item.patientId})</span></p>
      <p class="text-xs text-slate-500 mt-0.5 line-clamp-1">${item.symptoms}</p>
      ${allergyTag}
      <div class="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-slate-100">
        <span>Checked in: ${item.checkInTime}</span>
        <span>BP: ${item.vitals.bp}</span>
      </div>
      ${actionBtn}
    </div>
  `;
}

function callPatientToCabin(token) {
  const target = queue.find(q => q.token === token);
  if (!target) return;

  // Move any currently serving patient in the SAME department back to waiting
  queue.forEach(q => {
    if (q.dept === target.dept && q.status === 'serving') {
      q.status = 'waiting';
    }
  });

  target.status = 'serving';
  refreshAllViews();
}

function openInDoctorView(dept) {
  document.getElementById('doctor-dept-select').value = dept;
  switchTab('doctor');
}

// --- 6. DOCTOR DASHBOARD ---
function renderDoctorDashboard() {
  const selectedDept = document.getElementById('doctor-dept-select').value;
  const deptQueue = queue.filter(q => q.dept === selectedDept && q.status !== 'completed');

  const queueListEl = document.getElementById('doctor-queue-list');
  if (!deptQueue.length) {
    queueListEl.innerHTML = '<p class="text-xs text-slate-400 italic py-4 text-center">No active patients in this department.</p>';
  } else {
    queueListEl.innerHTML = deptQueue.map(q => {
      const p = patients.find(item => item.id === q.patientId);
      const isServing = q.status === 'serving';
      return `
        <div class="p-3 rounded-xl border ${isServing ? 'border-emerald-400 bg-emerald-50/60' : 'border-slate-200 bg-slate-50'} flex items-center justify-between gap-2">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-xs px-2 py-0.5 rounded ${isServing ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-800'}">${q.token}</span>
              <span class="font-semibold text-sm text-slate-900">${p ? p.name : q.patientId}</span>
            </div>
            <p class="text-xs text-slate-500 mt-1 line-clamp-1">${q.symptoms}</p>
          </div>
          ${!isServing ? `<button onclick="callPatientToCabin('${q.token}')" class="shrink-0 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg">Call</button>` : '<span class="text-[11px] font-bold text-emerald-700">Active</span>'}
        </div>
      `;
    }).join('');
  }

  // Load Active Patient in Cabin
  const activeVisit = deptQueue.find(q => q.status === 'serving');
  const emptyState = document.getElementById('doctor-empty-state');
  const activeChart = document.getElementById('doctor-active-chart');

  if (!activeVisit) {
    emptyState.classList.remove('hidden');
    activeChart.classList.add('hidden');
    return;
  }

  const patient = patients.find(p => p.id === activeVisit.patientId);
  if (!patient) return;

  emptyState.classList.add('hidden');
  activeChart.classList.remove('hidden');

  // Populate Chart Details
  document.getElementById('doc-token-badge').textContent = activeVisit.token;
  document.getElementById('doc-patient-name').textContent = patient.name;
  document.getElementById('doc-patient-meta').textContent = `${patient.age} yrs • ${patient.gender} • Blood Group: ${patient.blood} • ID: ${patient.id}`;

  document.getElementById('doc-vital-bp').textContent = `${activeVisit.vitals.bp} mmHg`;
  document.getElementById('doc-vital-temp').textContent = `${activeVisit.vitals.temp} °F`;
  document.getElementById('doc-vital-pulse').textContent = `${activeVisit.vitals.pulse} bpm`;
  document.getElementById('doc-symptoms').textContent = activeVisit.symptoms;

  // Allergy Banner
  const allergyBanner = document.getElementById('doc-allergy-banner');
  if (patient.allergies) {
    allergyBanner.classList.remove('hidden');
    document.getElementById('doc-allergy-text').textContent = patient.allergies;
  } else {
    allergyBanner.classList.add('hidden');
  }

  // Render Past Medical History
  const historyList = document.getElementById('doc-history-list');
  if (!patient.history || !patient.history.length) {
    historyList.innerHTML = '<p class="text-xs text-slate-400 italic">No previous OPD records on file for this patient.</p>';
  } else {
    historyList.innerHTML = patient.history.map(h => `
      <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm">
        <div class="flex justify-between items-center text-xs text-slate-500 mb-1">
          <span class="font-bold text-teal-700">${h.dept}</span>
          <span>${h.date}</span>
        </div>
        <p class="font-bold text-slate-900">${h.diagnosis}</p>
        <p class="text-xs text-slate-600 mt-1">${h.prescription}</p>
        <p class="text-[11px] text-slate-400 mt-1.5 font-mono">${h.vitals}</p>
      </div>
    `).join('');
  }

  lucide.createIcons();
}

function completeConsultation(e) {
  e.preventDefault();

  const selectedDept = document.getElementById('doctor-dept-select').value;
  const activeVisit = queue.find(q => q.dept === selectedDept && q.status === 'serving');
  if (!activeVisit) return;

  const patient = patients.find(p => p.id === activeVisit.patientId);
  const diagnosis = document.getElementById('doc-diagnosis').value.trim();
  const prescription = document.getElementById('doc-prescription').value.trim();
  const followUpDate = document.getElementById('doc-followup-date').value;
  const followUpNote = document.getElementById('doc-followup-note').value.trim();

  // Save to Patient History
  const todayStr = new Date().toISOString().split('T')[0];
  patient.history.unshift({
    date: todayStr,
    dept: activeVisit.dept,
    diagnosis,
    prescription,
    vitals: `BP: ${activeVisit.vitals.bp} | Temp: ${activeVisit.vitals.temp}°F | Pulse: ${activeVisit.vitals.pulse} bpm`
  });

  // Create Follow-Up Entry if Scheduled
  if (followUpDate) {
    followUps.unshift({
      id: `FU-${followUps.length + 1}`,
      patientId: patient.id,
      dept: activeVisit.dept,
      date: followUpDate,
      note: followUpNote || `Follow-up for ${diagnosis}`,
      status: 'Scheduled'
    });
  }

  // Mark Token Completed
  activeVisit.status = 'completed';

  // Clear Doctor Form
  document.getElementById('doc-diagnosis').value = '';
  document.getElementById('doc-prescription').value = '';
  document.getElementById('doc-followup-date').value = '';
  document.getElementById('doc-followup-note').value = '';

  refreshAllViews();
}

// --- 7. PATIENTS DIRECTORY & VISIT HISTORY ---
function renderPatientsDirectory() {
  const query = document.getElementById('patient-search-input').value.toLowerCase().trim();
  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.id.toLowerCase().includes(query) ||
    p.phone.toLowerCase().includes(query)
  );

  const grid = document.getElementById('patients-grid');
  grid.innerHTML = filtered.map(p => {
    const allergyHtml = p.allergies
      ? `<div class="mt-3 bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
           <i data-lucide="alert-triangle" class="w-3.5 h-3.5 shrink-0"></i> Allergy: ${p.allergies}
         </div>`
      : `<div class="mt-3 bg-slate-50 text-slate-500 px-3 py-1.5 rounded-lg text-xs">No known allergies</div>`;

    const latestVisit = p.history && p.history.length
      ? `<div class="mt-3 pt-3 border-t border-slate-100 text-xs">
           <span class="text-slate-400 block">Last Visit (${p.history[0].date} • ${p.history[0].dept}):</span>
           <span class="font-semibold text-slate-800">${p.history[0].diagnosis}</span>
         </div>`
      : `<div class="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400 italic">No recorded visits yet</div>`;

    return `
      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-start">
            <div>
              <span class="text-xs font-mono font-bold text-teal-600">${p.id}</span>
              <h3 class="text-base font-bold text-slate-900">${p.name}</h3>
              <p class="text-xs text-slate-500">${p.age} yrs • ${p.gender} • Blood: ${p.blood}</p>
            </div>
            <span class="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium">${p.history.length} Visits</span>
          </div>
          <p class="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
            <i data-lucide="phone" class="w-3.5 h-3.5"></i> ${p.phone}
          </p>
          ${allergyHtml}
          ${latestVisit}
        </div>
        <button onclick="openQrWithId('${p.id}')" class="mt-4 w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-2 rounded-lg transition">
          View Full Profile & QR
        </button>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

// --- 8. FOLLOW-UP SYSTEM ---
function renderFollowUps() {
  const tbody = document.getElementById('followups-table-body');
  if (!followUps.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-slate-400 text-sm">No follow-ups scheduled.</td></tr>';
    return;
  }

  tbody.innerHTML = followUps.map(fu => {
    const p = patients.find(item => item.id === fu.patientId);
    const isDone = fu.status === 'Checked In';
    return `
      <tr class="hover:bg-slate-50/70">
        <td class="py-3.5 px-5 font-semibold text-slate-900">${fu.date}</td>
        <td class="py-3.5 px-5">
          <div class="font-bold text-slate-900">${p ? p.name : fu.patientId}</div>
          <div class="text-xs text-slate-400 font-mono">${fu.patientId}</div>
        </td>
        <td class="py-3.5 px-5"><span class="bg-teal-50 text-teal-700 text-xs font-semibold px-2.5 py-1 rounded-md">${fu.dept}</span></td>
        <td class="py-3.5 px-5 text-slate-600">${fu.note}</td>
        <td class="py-3.5 px-5">
          <span class="text-xs font-bold px-2.5 py-1 rounded-full ${isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
            ${fu.status}
          </span>
        </td>
        <td class="py-3.5 px-5 text-right">
          ${!isDone
            ? `<button onclick="checkInFromFollowUp('${fu.id}')" class="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition">Check-In & Token</button>`
            : '<span class="text-xs text-slate-400">Token Issued</span>'}
        </td>
      </tr>
    `;
  }).join('');
}

function checkInFromFollowUp(fuId) {
  const fu = followUps.find(item => item.id === fuId);
  if (!fu) return;

  fu.status = 'Checked In';
  switchTab('reception');
  setRegMode('existing');
  document.getElementById('existing-patient-select').value = fu.patientId;
  populateExistingPatient();
  document.getElementById('reg-dept').value = fu.dept;
  document.getElementById('reg-symptoms').value = `Follow-Up Visit: ${fu.note}`;
}

// --- 9. QR IDENTIFICATION MODAL ---
function openQrModal() {
  document.getElementById('qr-modal').classList.remove('hidden');
  document.getElementById('qr-lookup-input').focus();
}

function closeQrModal() {
  document.getElementById('qr-modal').classList.add('hidden');
  document.getElementById('qr-lookup-result').classList.add('hidden');
  document.getElementById('qr-lookup-input').value = '';
}

function openQrWithId(id) {
  openQrModal();
  quickFillQr(id);
}

function quickFillQr(val) {
  document.getElementById('qr-lookup-input').value = val;
  performQrLookup();
}

function performQrLookup() {
  const raw = document.getElementById('qr-lookup-input').value.trim().toUpperCase();
  const resultBox = document.getElementById('qr-lookup-result');
  if (!raw) return;

  // Match either Patient ID or Token
  let patient = patients.find(p => p.id.toUpperCase() === raw);
  let queueItem = queue.find(q => q.token.toUpperCase() === raw);

  if (!patient && queueItem) {
    patient = patients.find(p => p.id === queueItem.patientId);
  }

  resultBox.classList.remove('hidden');

  if (!patient) {
    resultBox.innerHTML = `<p class="text-sm text-red-600 font-semibold">No patient record found matching "${raw}".</p>`;
    return;
  }

  const qrPayload = encodeURIComponent(`MEDCORE|${patient.id}|${patient.name}`);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${qrPayload}`;

  resultBox.innerHTML = `
    <div class="flex items-center gap-4">
      <img src="${qrUrl}" alt="QR" class="w-16 h-16 rounded-lg border border-slate-200 bg-white p-1">
      <div>
        <span class="text-xs font-mono font-bold text-teal-600">${patient.id}</span>
        <h4 class="text-base font-bold text-slate-900">${patient.name}</h4>
        <p class="text-xs text-slate-500">${patient.age} yrs • ${patient.gender} • Blood: ${patient.blood} • ${patient.phone}</p>
      </div>
    </div>
    ${patient.allergies ? `<div class="bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-lg">ALLERGY ALERT: ${patient.allergies}</div>` : ''}
    <div class="pt-2 border-t border-slate-200">
      <p class="text-xs font-bold uppercase text-slate-500 mb-1.5">Recent Medical History (${patient.history.length})</p>
      ${patient.history.length
        ? patient.history.map(h => `<div class="text-xs bg-white p-2.5 rounded-lg border border-slate-200 mb-1.5"><strong>${h.date} (${h.dept}):</strong> ${h.diagnosis} — <span class="text-slate-500">${h.prescription}</span></div>`).join('')
        : '<p class="text-xs text-slate-400 italic">No previous visits.</p>'}
    </div>
  `;
}
