import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Star, Clock, MapPin, Calendar, ChevronRight } from 'lucide-react';
import { doctorAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const SPECIALTIES = ['All', 'Cardiology', 'Neurology', 'Orthopedics', 'General', 'Pediatrics', 'Dermatology', 'Oncology', 'ENT'];

export default function FindDoctors({ onBook }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('All');
  const navigate = useNavigate();

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await doctorAPI.getAll({});
      if (res.success) setDoctors(res.data || []);
    } catch { toast.error('Failed to load doctors'); }
    finally { setLoading(false); }
  };

  const filtered = doctors.filter(d => {
    const name = `${d.user?.firstName || ''} ${d.user?.lastName || ''}`.toLowerCase();
    const spec = (d.specialization || '').toLowerCase();
    const q = search.toLowerCase();
    const matchSearch = !search || name.includes(q) || spec.includes(q);
    const matchSpec = specialty === 'All' || spec.includes(specialty.toLowerCase());
    return matchSearch && matchSpec;
  });

  return (
    <div>
      {/* Search Bar */}
      <div className="glass-card-sm" style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div className="input-wrapper" style={{ flex: 1 }}>
          <Search size={18} className="input-icon-left" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="input-glass input-with-left-icon" placeholder="Search by name or specialty…" />
        </div>
        <select value={specialty} onChange={e => setSpecialty(e.target.value)} className="input-glass select-glass" style={{ width: 'auto', minWidth: '160px' }}>
          {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner spinner-lg" /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Search size={40} color="var(--outline)" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--on-surface-var)' }}>No doctors found matching your search</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filtered.map(doctor => {
            const name = `Dr. ${doctor.user?.firstName || ''} ${doctor.user?.lastName || ''}`.trim();
            const rating = (doctor.rating || 4.5).toFixed(1);
            const reviews = doctor.reviewCount || Math.floor(Math.random() * 200) + 20;
            const fee = doctor.consultationFee || 500;
            const initials = (doctor.user?.firstName?.[0] || 'D').toUpperCase();
            return (
              <div key={doctor._id} className="glass-card-sm" style={{ cursor: 'default' }}>
                <div style={{ display: 'flex', gap: '14px', marginBottom: '16px' }}>
                  <div className="avatar avatar-lg avatar-gradient">{initials}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--on-surface)', marginBottom: '4px' }}>{name}</p>
                    <p style={{ fontSize: '13px', color: 'var(--secondary)', fontWeight: 600, marginBottom: '8px' }}>{doctor.specialization || 'General'}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Star size={13} color="#f59e0b" fill="#f59e0b" />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--on-surface)' }}>{rating}</span>
                      <span style={{ fontSize: '12px', color: 'var(--outline)' }}>({reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--on-surface-var)' }}>
                    <Clock size={13} color="var(--outline)" />
                    {doctor.experience || 5}+ yrs exp.
                  </div>
                  {doctor.department?.name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--on-surface-var)' }}>
                      <MapPin size={13} color="var(--outline)" />
                      {doctor.department.name}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', color: 'var(--primary)' }}>₹{fee}</span>
                    <span style={{ fontSize: '12px', color: 'var(--outline)', marginLeft: '4px' }}>/ visit</span>
                  </div>
                  <button onClick={() => navigate(`?section=book-appointment&doctorId=${doctor._id}`)} className="btn btn-primary btn-sm" style={{ border: 'none', cursor: 'pointer' }}>
                    Book <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
