import { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2 } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

export default function ManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', head: '' });

  useEffect(() => { fetchDepts(); }, []);

  const fetchDepts = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getDepartments();
      if (res.success) setDepartments(res.data || []);
    } catch { toast.error('Failed to load departments'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await adminAPI.updateDepartment(editId, form);
        toast.success('Department updated!');
      } else {
        await adminAPI.createDepartment(form);
        toast.success('Department created!');
      }
      setShowForm(false); setEditId(null); setForm({ name: '', description: '', head: '' });
      fetchDepts();
    } catch { toast.error('Operation failed'); }
  };

  const deleteDept = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try { await adminAPI.deleteDepartment(id); toast.success('Deleted'); fetchDepts(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="headline-sm">Departments ({departments.length})</h2>
        <button type="button" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', description: '', head: '' }); }} className="btn btn-primary btn-sm">
          <Plus size={15} /> Add Department
        </button>
      </div>

      {showForm && (
        <div className="glass-card-sm" style={{ marginBottom: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>{editId ? 'Edit' : 'Create'} Department</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Name *</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-glass" placeholder="e.g. Cardiology" required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Head of Department</label>
              <input type="text" value={form.head} onChange={e => setForm(f => ({ ...f, head: e.target.value }))} className="input-glass" placeholder="Department head name" />
            </div>
            <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
              <label className="form-label">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-glass" rows={2} style={{ resize: 'vertical' }} placeholder="Brief description…" />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '8px' }}>
              <button type="submit" className="btn btn-primary btn-sm">{editId ? 'Update' : 'Create'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost btn-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner spinner-lg" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {departments.map(dept => (
            <div key={dept._id} className="glass-card-sm">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={20} color="white" />
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button type="button" onClick={() => { setEditId(dept._id); setForm({ name: dept.name, description: dept.description || '', head: dept.head || '' }); setShowForm(true); }} className="btn-icon" style={{ width: 32, height: 32 }}>
                    <Edit2 size={13} />
                  </button>
                  <button type="button" onClick={() => deleteDept(dept._id)} className="btn-icon" style={{ width: 32, height: 32, color: 'var(--error)' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>{dept.name}</h3>
              {dept.head && <p style={{ fontSize: '13px', color: 'var(--secondary)', marginBottom: '6px' }}>Head: {dept.head}</p>}
              {dept.description && <p style={{ fontSize: '13px', color: 'var(--on-surface-var)', lineHeight: '1.5' }}>{dept.description}</p>}
              {dept.doctorsCount !== undefined && <span className="badge badge-info" style={{ marginTop: '10px', fontSize: '11px' }}>{dept.doctorsCount} doctors</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
