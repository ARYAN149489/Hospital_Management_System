import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TestTube, Calendar, Clock, ChevronDown, ChevronUp, Download, FileText } from 'lucide-react';
import { patientAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const STATUS_COLORS = {
  pending: 'badge-pending',
  completed: 'badge-stable',
  report_ready: 'badge-teal',
  cancelled: 'badge-critical',
  processing: 'badge-info'
};

const FLAG_COLORS = {
  normal: 'rgba(0, 106, 106, 0.1)',
  low: 'rgba(217, 119, 6, 0.1)',
  high: 'rgba(217, 119, 6, 0.1)',
  abnormal: 'rgba(217, 119, 6, 0.1)',
  critical: 'rgba(239, 68, 68, 0.1)'
};

const FLAG_TEXT_COLORS = {
  normal: 'var(--secondary)',
  low: '#d97706',
  high: '#d97706',
  abnormal: '#d97706',
  critical: 'var(--error)'
};

export default function LabTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    patientAPI.getLabTests()
      .then(r => { if (r.success) setTests(r.data || []); })
      .catch(() => toast.error('Failed to load lab tests'))
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = (test) => {
    const patName = `${test.patient?.user?.firstName || ''} ${test.patient?.user?.lastName || ''}`.trim() || 'Patient';
    const dateObj = test.scheduledDate ? new Date(test.scheduledDate) : new Date(test.createdAt);
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = test.scheduledTime || 'N/A';
    const dob = test.patient?.user?.dateOfBirth;
    const age = dob ? Math.floor((new Date() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000)) : 'N/A';
    const gender = test.patient?.user?.gender || 'N/A';
    const bloodGroup = test.patient?.bloodGroup || 'N/A';

    const printWindow = window.open('', '_blank', 'width=850,height=900');
    if (!printWindow) {
      toast.error('Popup blocked! Please allow popups for this site.');
      return;
    }

    const rowsHtml = (test.results || []).map((res, index) => {
      const isOut = ['low', 'high', 'abnormal', 'critical'].includes(res.status);
      const flagText = isOut ? res.status.toUpperCase() : 'NORMAL';
      const flagColor = res.status === 'critical' ? '#ef4444' : (isOut ? '#d97706' : '#0f766e');
      
      return `
        <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #1e293b;">${res.parameter}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: ${isOut ? '#ef4444' : '#1e293b'};">${res.value}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #475569;">${res.unit || '—'}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #475569;">${res.normalRange || '—'}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: ${flagColor}; font-weight: 800; font-size: 11px;">
            ${flagText}
            ${res.status === 'critical' ? ' ⚠️' : ''}
          </td>
        </tr>
      `;
    }).join('');

    const interpretationHtml = test.resultSummary?.interpretation ? `
      <div style="margin-bottom: 20px; background: #f8fafc; border-left: 4px solid #0f766e; padding: 14px; border-radius: 0 8px 8px 0;">
        <h4 style="margin: 0 0 6px 0; color: #0f766e; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Pathologist's Interpretation</h4>
        <p style="margin: 0; font-size: 13px; color: #334155; white-space: pre-line;">${test.resultSummary.interpretation}</p>
      </div>
    ` : '';

    const recommendationsHtml = test.resultSummary?.recommendations ? `
      <div style="margin-bottom: 24px; background: #f8fafc; border-left: 4px solid #d97706; padding: 14px; border-radius: 0 8px 8px 0;">
        <h4 style="margin: 0 0 6px 0; color: #d97706; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Clinical Recommendations</h4>
        <p style="margin: 0; font-size: 13px; color: #334155; white-space: pre-line;">${test.resultSummary.recommendations}</p>
      </div>
    ` : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Report_${test.labTestId || 'Lab'}</title>
          <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; margin: 0; padding: 40px; line-height: 1.5; font-size: 13px; }
            .header-container { display: flex; justify-content: space-between; border-bottom: 3px solid #0f766e; padding-bottom: 20px; margin-bottom: 25px; align-items: center; }
            .hospital-logo { display: flex; flex-direction: column; }
            .hospital-name { font-size: 26px; font-weight: 900; color: #0f766e; letter-spacing: -0.5px; margin: 0; }
            .hospital-tag { font-size: 10px; text-transform: uppercase; color: #64748b; letter-spacing: 1.5px; font-weight: 700; margin: 2px 0 0 0; }
            .hospital-details { text-align: right; font-size: 11px; color: #64748b; line-height: 1.6; }
            .report-title { text-align: center; font-size: 18px; font-weight: 800; color: #0f172a; margin: 20px 0; border: 1.5px solid #cbd5e1; padding: 8px; border-radius: 6px; letter-spacing: 0.5px; background: #f8fafc; }
            .details-section { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; }
            .info-card h3 { margin: 0 0 10px 0; font-size: 11px; text-transform: uppercase; color: #475569; letter-spacing: 1px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; font-weight: 800; }
            .info-row { display: flex; margin-bottom: 6px; }
            .info-label { width: 120px; color: #64748b; font-weight: 500; }
            .info-val { flex: 1; font-weight: 700; color: #0f172a; }
            .table-results { width: 100%; border-collapse: collapse; margin-bottom: 30px; text-align: left; }
            .table-results th { background: #0f766e; color: #ffffff; padding: 12px; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border: none; }
            .table-results th:first-child { border-radius: 6px 0 0 6px; }
            .table-results th:last-child { border-radius: 0 6px 6px 0; }
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
              <strong>Medicare Plus Laboratories</strong><br>
              123 Healthcare Blvd, Medical District, NY 10001<br>
              Phone: +1 (555) 019-2834 | Email: lab@medicareplus.com
            </div>
          </div>

          <div class="report-title">DIAGNOSTIC LABORATORY REPORT</div>

          <div class="details-section">
            <div class="info-card">
              <h3>Patient Details</h3>
              <div class="info-row"><span class="info-label">Patient Name:</span><span class="info-val">${patName}</span></div>
              <div class="info-row"><span class="info-label">Age / Gender:</span><span class="info-val">${age} Yrs / ${gender}</span></div>
              <div class="info-row"><span class="info-label">Blood Group:</span><span class="info-val">${bloodGroup}</span></div>
              <div class="info-row"><span class="info-label">Patient ID:</span><span class="info-val">${test.patient?.patientId || '—'}</span></div>
            </div>
            <div class="info-card">
              <h3>Test & Lab Details</h3>
              <div class="info-row"><span class="info-label">Test Name:</span><span class="info-val">${test.testName}</span></div>
              <div class="info-row"><span class="info-label">Lab Name:</span><span class="info-val">${test.labName || 'Hospital Lab'}</span></div>
              <div class="info-row"><span class="info-label">Scheduled Date:</span><span class="info-val">${dateStr} · ${timeStr}</span></div>
              <div class="info-row"><span class="info-label">Report ID:</span><span class="info-val">${test.labTestId || '—'}</span></div>
            </div>
          </div>

          <table class="table-results">
            <thead>
              <tr>
                <th style="width: 35%;">Test Parameter</th>
                <th style="width: 15%;">Result Value</th>
                <th style="width: 15%;">Unit</th>
                <th style="width: 20%;">Reference Interval</th>
                <th style="width: 15%;">Flag</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          ${interpretationHtml}
          ${recommendationsHtml}

          <div class="signature-block">
            <div class="sig-pad">
              <div class="sig-line">
                <span class="sig-signed">${test.testedBy?.name || 'Jane Smith'}</span>
              </div>
              <strong style="color: #0f172a;">${test.testedBy?.name || 'Jane Smith'}</strong><br>
              <span style="color: #64748b; font-size: 11px;">${test.testedBy?.qualification || 'Lab Technician'}</span><br>
              <span style="color: #94a3b8; font-size: 10px;">Tested By</span>
            </div>
            <div class="sig-pad">
              <div class="sig-line">
                <span class="sig-signed">${test.verifiedBy?.name || 'Dr. Rajesh Kumar'}</span>
              </div>
              <strong style="color: #0f172a;">${test.verifiedBy?.name || 'Dr. Rajesh Kumar'}</strong><br>
              <span style="color: #64748b; font-size: 11px;">${test.verifiedBy?.qualification || 'MD, Pathologist'}</span><br>
              <span style="color: #94a3b8; font-size: 10px;">Authorized Signatory</span>
            </div>
          </div>

          <div class="footer-info">
            This is a secure, digitally signed laboratory report. Valid for diagnostic reference. Confidential medical report.<br>
            Medicare Plus Laboratories &copy; 2026. All Rights Reserved.
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="headline-sm">Lab Tests</h2>
        <button onClick={() => navigate('?section=book-lab-test')} className="btn btn-primary btn-sm" style={{ border: 'none', cursor: 'pointer' }}>
          Book New Test
        </button>
      </div>

      {tests.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
          <TestTube size={48} color="var(--outline)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--on-surface-var)', marginBottom: '20px' }}>No lab tests booked yet</p>
          <button onClick={() => navigate('?section=book-lab-test')} className="btn btn-primary btn-sm" style={{ border: 'none', cursor: 'pointer' }}>Book a Lab Test</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {tests.map(test => {
            const date = test.scheduledDate ? new Date(test.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
            const isOpen = expanded === test._id;
            const hasResults = test.results && test.results.length > 0;
            
            return (
              <div key={test._id} className="glass-card-sm" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: hasResults ? 'pointer' : 'default' }} onClick={() => hasResults && setExpanded(isOpen ? null : test._id)}>
                  <div style={{ display: 'flex', gap: '14px' }}>
                    <div style={{ width: 46, height: 46, background: 'rgba(0,106,106,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TestTube size={22} color="var(--secondary)" />
                    </div>
                    <div>
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{test.testName || test.testType || 'Lab Test'}</p>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'var(--on-surface-var)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={13} />{date}</span>
                        {test.scheduledTime && <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={13} />{test.scheduledTime}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`badge ${STATUS_COLORS[test.status] || 'badge-info'}`} style={{ textTransform: 'capitalize' }}>
                      {(test.status || 'pending').replace('_', ' ')}
                    </span>
                    {hasResults && (
                      isOpen ? <ChevronUp size={18} color="var(--outline)" /> : <ChevronDown size={18} color="var(--outline)" />
                    )}
                  </div>
                </div>

                {hasResults && isOpen && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--surface-high)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--secondary)' }}>Report Details</h4>
                      <button onClick={(e) => { e.stopPropagation(); handlePrint(test); }} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Download size={14} /> Download Report PDF
                      </button>
                    </div>

                    <table className="glass-table" style={{ width: '100%', marginBottom: '16px' }}>
                      <thead>
                        <tr>
                          <th>Parameter</th>
                          <th>Result</th>
                          <th>Unit</th>
                          <th>Reference Interval</th>
                          <th>Flag</th>
                        </tr>
                      </thead>
                      <tbody>
                        {test.results.map((res, idx) => {
                          const isOut = ['low', 'high', 'abnormal', 'critical'].includes(res.status);
                          return (
                            <tr key={idx}>
                              <td style={{ fontWeight: 600 }}>{res.parameter}</td>
                              <td style={{ fontWeight: 700, color: isOut ? 'var(--error)' : 'inherit' }}>{res.value}</td>
                              <td>{res.unit || '—'}</td>
                              <td>{res.normalRange || '—'}</td>
                              <td>
                                <span style={{
                                  padding: '2px 8px', borderRadius: '4px',
                                  background: FLAG_COLORS[res.status] || 'rgba(0,0,0,0.05)',
                                  color: FLAG_TEXT_COLORS[res.status] || 'inherit',
                                  fontSize: '11px', fontWeight: 700, textTransform: 'uppercase'
                                }}>
                                  {res.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {test.resultSummary?.interpretation && (
                      <div style={{ padding: '12px', background: 'var(--surface-low)', borderRadius: '8px', marginBottom: '12px' }}>
                        <strong>Interpretation / Findings:</strong>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--on-surface-var)', whiteSpace: 'pre-line' }}>{test.resultSummary.interpretation}</p>
                      </div>
                    )}

                    {test.resultSummary?.recommendations && (
                      <div style={{ padding: '12px', background: 'var(--surface-low)', borderRadius: '8px', marginBottom: '12px' }}>
                        <strong>Recommendations:</strong>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--on-surface-var)', whiteSpace: 'pre-line' }}>{test.resultSummary.recommendations}</p>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--outline)', marginTop: '16px', background: 'var(--surface-low)', padding: '8px 12px', borderRadius: '6px' }}>
                      <span><strong>Tested By:</strong> {test.testedBy?.name || 'Technician'} ({test.testedBy?.qualification || 'MLT'})</span>
                      <span><strong>Verified By:</strong> {test.verifiedBy?.name || 'Pathologist'} ({test.verifiedBy?.qualification || 'MD'})</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
