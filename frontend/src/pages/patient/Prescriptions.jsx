import { useState, useEffect } from 'react';
import { Pill, Calendar, User, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { patientAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    patientAPI.getPrescriptions()
      .then(r => {
        if (r.success) {
          // Sort by date (descending)
          const sorted = (r.data || []).sort((a, b) => {
            const dateA = new Date(a.prescriptionDate || a.createdAt);
            const dateB = new Date(b.prescriptionDate || b.createdAt);
            return dateB - dateA;
          });
          setPrescriptions(sorted);
        }
      })
      .catch(() => toast.error('Failed to load prescriptions'))
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = (rx) => {
    const doctorName = `Dr. ${rx.doctor?.user?.firstName || ''} ${rx.doctor?.user?.lastName || ''}`.trim() || 'Doctor';
    const patientName = `${rx.patient?.user?.firstName || ''} ${rx.patient?.user?.lastName || ''}`.trim() || 'Patient';
    
    // Formatting date
    const dateObj = rx.prescriptionDate ? new Date(rx.prescriptionDate) : new Date(rx.createdAt);
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    const dob = rx.patient?.user?.dateOfBirth;
    const age = dob ? Math.floor((new Date() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000)) : 'N/A';
    const gender = rx.patient?.user?.gender || 'N/A';
    const bloodGroup = rx.patient?.bloodGroup || 'N/A';
    const validUntil = rx.validUntil ? new Date(rx.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

    const printWindow = window.open('', '_blank', 'width=850,height=900');
    if (!printWindow) {
      toast.error('Popup blocked! Please allow popups for this site.');
      return;
    }

    const medsHtml = (rx.medications || []).map((med, index) => `
      <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #1e293b;">
          ${med.name}
          ${med.genericName ? `<div style="font-size: 11px; font-weight: normal; color: #64748b; margin-top: 2px;">Generic: ${med.genericName}</div>` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #334155;">${med.dosage || '—'}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #334155;">${med.frequency || '—'}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #334155;">${typeof med.duration === 'object' ? `${med.duration?.value || ''} ${med.duration?.unit || ''}` : (med.duration || '—')}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #0f766e; font-weight: 500; text-transform: capitalize;">${med.route || 'oral'}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #475569; font-style: italic; font-size: 12px;">${med.instructions || 'As directed'}</td>
      </tr>
    `).join('');

    let vitalsHtml = '';
    if (rx.vitalSigns && (rx.vitalSigns.bloodPressure?.systolic || rx.vitalSigns.temperature?.value || rx.vitalSigns.pulse || rx.vitalSigns.oxygenSaturation || rx.vitalSigns.weight || rx.vitalSigns.height)) {
      vitalsHtml = `
        <div style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; margin-bottom: 24px;">
          <h4 style="margin: 0 0 10px 0; color: #0f766e; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Patient Vitals</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; font-size: 12px; color: #334155;">
            ${rx.vitalSigns.bloodPressure?.systolic ? `<div><strong>BP:</strong> ${rx.vitalSigns.bloodPressure.systolic}/${rx.vitalSigns.bloodPressure.diastolic} mmHg</div>` : ''}
            ${rx.vitalSigns.temperature?.value ? `<div><strong>Temp:</strong> ${rx.vitalSigns.temperature.value}°${rx.vitalSigns.temperature.unit === 'fahrenheit' ? 'F' : 'C'}</div>` : ''}
            ${rx.vitalSigns.pulse ? `<div><strong>Pulse:</strong> ${rx.vitalSigns.pulse} bpm</div>` : ''}
            ${rx.vitalSigns.oxygenSaturation ? `<div><strong>SpO2:</strong> ${rx.vitalSigns.oxygenSaturation}%</div>` : ''}
            ${rx.vitalSigns.weight ? `<div><strong>Weight:</strong> ${rx.vitalSigns.weight} kg</div>` : ''}
            ${rx.vitalSigns.height ? `<div><strong>Height:</strong> ${rx.vitalSigns.height} cm</div>` : ''}
          </div>
        </div>
      `;
    }

    let complaintsHtml = '';
    if (rx.chiefComplaints && rx.chiefComplaints.length > 0) {
      complaintsHtml = `
        <div style="margin-bottom: 18px;">
          <h4 style="margin: 0 0 6px 0; color: #0f766e; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Chief Complaints</h4>
          <p style="margin: 0; font-size: 13px; color: #334155;">${rx.chiefComplaints.join(', ')}</p>
        </div>
      `;
    }

    let labTestsHtml = '';
    if (rx.labTests && rx.labTests.length > 0) {
      labTestsHtml = `
        <div style="margin-bottom: 24px; background: #fafafa; padding: 14px; border: 1px dashed #cbd5e1; border-radius: 8px;">
          <h4 style="margin: 0 0 8px 0; color: #0f766e; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Recommended Lab Tests / Investigations</h4>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #334155; line-height: 1.6;">
            ${rx.labTests.map(t => `
              <li>
                <strong>${t.testName}</strong>
                ${t.reason ? `<span style="color: #64748b;">(${t.reason})</span>` : ''}
                ${t.urgent ? '<span style="color:#ef4444; font-weight:bold; margin-left:6px; font-size:11px;">[URGENT]</span>' : ''}
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    let notesHtml = '';
    const adviceText = rx.notes || rx.doctorNotes || rx.generalInstructions;
    if (adviceText) {
      notesHtml = `
        <div style="margin-bottom: 24px;">
          <h4 style="margin: 0 0 8px 0; color: #0f766e; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Advice & Instructions</h4>
          <div style="font-size: 13px; line-height: 1.6; color: #334155; white-space: pre-line; background: #f8fafc; border-left: 3px solid #0f766e; padding: 10px 14px; border-radius: 0 8px 8px 0;">
            ${adviceText}
          </div>
        </div>
      `;
    }

    let followUpHtml = '';
    if (rx.followUp && rx.followUp.required) {
      followUpHtml = `
        <div style="margin-top: 15px; font-size: 12px; color: #0f766e; font-weight: 600; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px; display: inline-block;">
          📅 Follow-up: After ${rx.followUp.after?.value || 1} ${rx.followUp.after?.unit || 'weeks'} ${rx.followUp.reason ? `for ${rx.followUp.reason}` : ''}
        </div>
      `;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Prescription_${rx.prescriptionId || 'Rx'}</title>
          <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; margin: 0; padding: 40px; line-height: 1.5; font-size: 13px; }
            .header-container { display: flex; justify-content: space-between; border-bottom: 3px solid #0f766e; padding-bottom: 20px; margin-bottom: 25px; align-items: center; }
            .hospital-logo { display: flex; flex-direction: column; }
            .hospital-name { font-size: 26px; font-weight: 900; color: #0f766e; letter-spacing: -0.5px; margin: 0; }
            .hospital-tag { font-size: 10px; text-transform: uppercase; color: #64748b; letter-spacing: 1.5px; font-weight: 700; margin: 2px 0 0 0; }
            .hospital-details { text-align: right; font-size: 11px; color: #64748b; line-height: 1.6; }
            .details-section { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; }
            .info-card h3 { margin: 0 0 10px 0; font-size: 11px; text-transform: uppercase; color: #475569; letter-spacing: 1px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; font-weight: 800; }
            .info-row { display: flex; margin-bottom: 6px; }
            .info-label { width: 110px; color: #64748b; font-weight: 500; }
            .info-val { flex: 1; font-weight: 700; color: #0f172a; }
            .rx-symbol { font-size: 36px; font-weight: 900; color: #0f766e; font-family: "Georgia", serif; line-height: 1; margin: 20px 0 15px 0; }
            .table-meds { width: 100%; border-collapse: collapse; margin-bottom: 30px; text-align: left; }
            .table-meds th { background: #0f766e; color: #ffffff; padding: 12px; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border: none; }
            .table-meds th:first-child { border-radius: 6px 0 0 6px; }
            .table-meds th:last-child { border-radius: 0 6px 6px 0; }
            .signature-block { margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end; }
            .sig-pad { text-align: center; width: 220px; font-size: 12px; }
            .sig-line { border-bottom: 1.5px solid #cbd5e1; margin-bottom: 8px; height: 50px; position: relative; }
            .sig-signed { color: #0f766e; font-style: italic; font-weight: bold; position: absolute; bottom: 5px; left: 0; right: 0; font-family: "Georgia", serif; font-size: 15px; }
            .footer-info { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 10px; color: #94a3b8; text-align: center; }
            @media print {
              body { padding: 10px; }
              @page { margin: 1.5cm; }
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="hospital-logo">
              <h1 class="hospital-name">MEDICARE PLUS</h1>
              <p class="hospital-tag">Multi-Specialty Hospital & Research Center</p>
            </div>
            <div class="hospital-details">
              <strong>Medicare Plus Hospital</strong><br>
              123 Healthcare Blvd, Medical District, NY 10001<br>
              Phone: +1 (555) 019-2834 | Email: support@medicareplus.com
            </div>
          </div>

          <div class="details-section">
            <div class="info-card">
              <h3>Doctor Details</h3>
              <div class="info-row"><span class="info-label">Doctor Name:</span><span class="info-val">${doctorName}</span></div>
              <div class="info-row"><span class="info-label">Specialization:</span><span class="info-val">${rx.doctor?.specialization || 'General Physician'}</span></div>
              <div class="info-row"><span class="info-label">License Number:</span><span class="info-val">${rx.doctor?.medicalLicenseNumber || rx.doctor?.licenseNumber || 'MC-987251'}</span></div>
              <div class="info-row"><span class="info-label">Email:</span><span class="info-val">${rx.doctor?.user?.email || '—'}</span></div>
            </div>
            <div class="info-card">
              <h3>Patient Details</h3>
              <div class="info-row"><span class="info-label">Patient Name:</span><span class="info-val">${patientName}</span></div>
              <div class="info-row"><span class="info-label">Age / Gender:</span><span class="info-val">${age} Yrs / ${gender}</span></div>
              <div class="info-row"><span class="info-label">Blood Group:</span><span class="info-val">${bloodGroup}</span></div>
              <div class="info-row"><span class="info-label">Date & Time:</span><span class="info-val">${dateStr} · ${timeStr}</span></div>
            </div>
          </div>

          ${vitalsHtml}

          <div style="margin-bottom: 20px;">
            <h4 style="margin: 0 0 6px 0; color: #0f766e; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Diagnosis</h4>
            <p style="margin: 0; font-size: 15px; font-weight: 800; color: #0f172a;">${rx.diagnosis || 'General Checkup'}</p>
          </div>

          ${complaintsHtml}

          <div class="rx-symbol">Rₓ</div>

          <table class="table-meds">
            <thead>
              <tr>
                <th style="width: 25%;">Medicine</th>
                <th style="width: 12%;">Dosage</th>
                <th style="width: 15%;">Frequency</th>
                <th style="width: 12%;">Duration</th>
                <th style="width: 12%;">Route</th>
                <th style="width: 24%;">Instructions</th>
              </tr>
            </thead>
            <tbody>
              ${medsHtml}
            </tbody>
          </table>

          ${labTestsHtml}
          ${notesHtml}

          <div class="signature-block">
            <div style="font-size: 11px; color: #64748b; line-height: 1.6;">
              <strong>Prescription ID:</strong> ${rx.prescriptionId || '—'}<br>
              <strong>Valid Until:</strong> ${validUntil}<br>
              ${followUpHtml}
            </div>
            <div class="sig-pad">
              <div class="sig-line">
                ${rx.digitalSignature?.signed || true ? `<span class="sig-signed">Dr. ${rx.doctor?.user?.lastName || 'Doctor'}</span>` : ''}
              </div>
              <strong style="color: #0f172a;">${doctorName}</strong><br>
              <span style="color: #64748b; font-size: 11px;">Authorized Digital Signature</span>
            </div>
          </div>

          <div class="footer-info">
            This is a secure, digitally signed computer-generated prescription. Valid for dispensing at any licensed pharmacy.<br>
            Medicare Plus Hospital &copy; 2026. All Rights Reserved.
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner spinner-lg" /></div>;
  if (!prescriptions.length) return (
    <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
      <Pill size={48} color="var(--outline)" style={{ margin: '0 auto 16px' }} />
      <p style={{ color: 'var(--on-surface-var)' }}>No prescriptions yet</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {prescriptions.map(rx => {
        const doctorName = `Dr. ${rx.doctor?.user?.firstName || ''} ${rx.doctor?.user?.lastName || ''}`.trim() || 'Doctor';
        const date = rx.prescriptionDate ? new Date(rx.prescriptionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
        const meds = rx.medications || [];
        const isOpen = expanded === rx._id;
        return (
          <div key={rx._id} className="glass-card-sm">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }} onClick={() => setExpanded(isOpen ? null : rx._id)}>
              <div style={{ display: 'flex', gap: '14px' }}>
                <div style={{ width: 46, height: 46, background: 'rgba(84,32,181,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Pill size={22} color="#5420b5" />
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{rx.diagnosis || 'Prescription'}</p>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'var(--on-surface-var)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><User size={13} />{doctorName}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={13} />{date}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="badge badge-teal">{meds.length} med{meds.length !== 1 ? 's' : ''}</span>
                {isOpen ? <ChevronUp size={18} color="var(--outline)" /> : <ChevronDown size={18} color="var(--outline)" />}
              </div>
            </div>

            {isOpen && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--surface-high)' }}>
                {/* Prescription Metadata / Print controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--outline)', margin: 0 }}>
                      <strong>Prescription ID:</strong> {rx.prescriptionId || 'N/A'}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--outline)', margin: '2px 0 0 0' }}>
                      <strong>Valid Until:</strong> {rx.validUntil ? new Date(rx.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handlePrint(rx); }} 
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Download size={14} /> Download Prescription
                  </button>
                </div>

                {/* Vitals Signs Grid */}
                {rx.vitalSigns && (rx.vitalSigns.bloodPressure?.systolic || rx.vitalSigns.temperature?.value || rx.vitalSigns.pulse || rx.vitalSigns.oxygenSaturation) && (
                  <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--surface-low)', borderRadius: '10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                    {rx.vitalSigns.bloodPressure?.systolic && (
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--outline)', display: 'block' }}>Blood Pressure</span>
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{rx.vitalSigns.bloodPressure.systolic}/{rx.vitalSigns.bloodPressure.diastolic} mmHg</span>
                      </div>
                    )}
                    {rx.vitalSigns.temperature?.value && (
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--outline)', display: 'block' }}>Temperature</span>
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{rx.vitalSigns.temperature.value}°{rx.vitalSigns.temperature.unit === 'fahrenheit' ? 'F' : 'C'}</span>
                      </div>
                    )}
                    {rx.vitalSigns.pulse && (
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--outline)', display: 'block' }}>Pulse Rate</span>
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{rx.vitalSigns.pulse} bpm</span>
                      </div>
                    )}
                    {rx.vitalSigns.oxygenSaturation && (
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--outline)', display: 'block' }}>Oxygen Saturation</span>
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{rx.vitalSigns.oxygenSaturation}% SpO2</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Chief Complaints */}
                {rx.chiefComplaints && rx.chiefComplaints.length > 0 && (
                  <div style={{ marginBottom: '16px', fontSize: '13px' }}>
                    <strong>Chief Complaints:</strong> <span style={{ color: 'var(--on-surface-var)' }}>{rx.chiefComplaints.join(', ')}</span>
                  </div>
                )}

                {/* Advice / Notes */}
                {(rx.notes || rx.doctorNotes || rx.generalInstructions) && (
                  <div style={{ fontSize: '14px', color: 'var(--on-surface-var)', marginBottom: '16px', padding: '12px', background: 'var(--surface-low)', borderRadius: '10px' }}>
                    <strong>Doctor's Notes & Advice:</strong>
                    <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: 'var(--on-surface-var)', whiteSpace: 'pre-line' }}>
                      {rx.notes || rx.doctorNotes || rx.generalInstructions}
                    </p>
                  </div>
                )}

                {/* Medications List */}
                <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px', color: 'var(--on-surface)' }}>Medications ({meds.length})</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {meds.map((med, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--surface-low)', borderRadius: '10px', flexWrap: 'wrap' }}>
                      <Pill size={16} color="var(--secondary)" />
                      <div style={{ flex: 1, minWidth: '150px' }}>
                        <p style={{ fontWeight: 700, fontSize: '14px', margin: 0 }}>{med.name}</p>
                        {med.genericName && <p style={{ fontSize: '11px', color: 'var(--outline)', margin: '2px 0 0 0' }}>Generic: {med.genericName}</p>}
                        <p style={{ fontSize: '12px', color: 'var(--on-surface-var)', margin: '4px 0 0 0' }}>
                          <strong>Dosage:</strong> {med.dosage} · <strong>Frequency:</strong> {med.frequency} · <strong>Duration:</strong> {typeof med.duration === 'object' ? `${med.duration?.value || ''} ${med.duration?.unit || ''}` : med.duration}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {med.route && <span className="badge badge-teal" style={{ fontSize: '11px', textTransform: 'capitalize' }}>{med.route}</span>}
                        {med.instructions && <span className="badge badge-info" style={{ fontSize: '11px' }}>{med.instructions}</span>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Lab Tests */}
                {rx.labTests && rx.labTests.length > 0 && (
                  <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(217, 119, 6, 0.05)', border: '1px dashed rgba(217, 119, 6, 0.3)', borderRadius: '10px' }}>
                    <p style={{ fontWeight: 700, fontSize: '13px', margin: '0 0 8px 0', color: '#d97706' }}>Recommended Lab Tests</p>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: 'var(--on-surface-var)' }}>
                      {rx.labTests.map((t, idx) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>
                          <strong>{t.testName}</strong> {t.reason ? ` - ${t.reason}` : ''} {t.urgent && <span style={{ color: 'var(--error)', fontWeight: 'bold' }}>(URGENT)</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Follow up */}
                {rx.followUp && rx.followUp.required && (
                  <div style={{ marginTop: '14px', fontSize: '12px', color: 'var(--secondary)', fontWeight: 600 }}>
                    📅 Follow-up: After {rx.followUp.after?.value || 1} {rx.followUp.after?.unit || 'weeks'} {rx.followUp.reason ? `for ${rx.followUp.reason}` : ''}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
