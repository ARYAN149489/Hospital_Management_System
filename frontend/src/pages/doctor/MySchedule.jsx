import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';
import { doctorAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SLOTS = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

// Helper to convert time from "08:00" to "08:00 AM"
const parseTime = (timeStr) => {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':');
  let hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  if (hour > 12) hour -= 12;
  if (hour === 0) hour = 12;
  return `${hour.toString().padStart(2, '0')}:${m} ${ampm}`;
};

// Helper to convert "08:00 AM" to "08:00"
const formatTime = (timeStr) => {
  if (!timeStr) return null;
  const match = timeStr.match(/^(\d{2}):(\d{2})\s(AM|PM)$/);
  if (!match) return timeStr;
  let [, h, m, ampm] = match;
  let hour = parseInt(h);
  if (ampm === 'PM' && hour < 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  return `${hour.toString().padStart(2, '0')}:${m}`;
};

export default function MySchedule() {
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    doctorAPI.getSchedule()
      .then(r => { 
         if (r.success) {
            const avail = Array.isArray(r.data) ? r.data : [];
            const schedObj = {};
            avail.forEach(dayItem => {
               const dayName = dayItem.day.charAt(0).toUpperCase() + dayItem.day.slice(1);
               const slots = (dayItem.slots || []).map(s => parseTime(s.startTime)).filter(Boolean);
               schedObj[dayName] = { isWorking: dayItem.isAvailable, slots };
            });
            setSchedule(schedObj);
         }
      })
      .catch(() => toast.error('Failed to load schedule'))
      .finally(() => setLoading(false));
  }, []);

  const toggleDay = (day) => {
    setSchedule(s => ({
      ...s,
      [day]: s[day] ? { ...s[day], isWorking: !s[day].isWorking } : { isWorking: true, slots: [] }
    }));
  };

  const toggleSlot = (day, slot) => {
    setSchedule(s => {
      const dayData = s[day] || { isWorking: true, slots: [] };
      const slots = dayData.slots || [];
      return {
        ...s,
        [day]: { ...dayData, slots: slots.includes(slot) ? slots.filter(sl => sl !== slot) : [...slots, slot] }
      };
    });
  };

  const saveSchedule = async () => {
    setSaving(true);
    try {
      const availability = Object.entries(schedule).map(([day, data]) => ({
         day: day.toLowerCase(),
         isAvailable: data.isWorking,
         slots: (data.slots || []).map(slotStr => {
            const t = formatTime(slotStr);
            const match = t.match(/^(\d{2}):(\d{2})$/);
            let endH = parseInt(match[1]) + 1;
            let endT = `${endH.toString().padStart(2, '0')}:${match[2]}`;
            return { startTime: t, endTime: endT };
         })
      }));
      const payload = { availability };
      
      const res = await doctorAPI.updateSchedule(payload);
      if (res.success) toast.success('Schedule saved!');
      else toast.error(res.message || 'Failed to save');
    } catch { toast.error('Error saving schedule'); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner spinner-lg" /></div>;

  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="headline-sm">My Schedule</h2>
        <button onClick={saveSchedule} disabled={saving} className="btn btn-primary btn-sm">
          {saving ? <div className="spinner spinner-sm" style={{ borderTopColor: 'white' }} /> : 'Save Schedule'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {DAYS.map(day => {
          const dayData = schedule[day] || { isWorking: false, slots: [] };
          return (
            <div key={day} className="glass-card-sm" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: dayData.isWorking ? '14px' : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: dayData.isWorking ? 'var(--secondary)' : 'var(--outline-var)' }} />
                  <p style={{ fontWeight: 700, fontSize: '15px', color: dayData.isWorking ? 'var(--on-surface)' : 'var(--on-surface-var)' }}>{day}</p>
                </div>
                <button onClick={() => toggleDay(day)}
                  style={{ width: 44, height: 24, borderRadius: '999px', border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: dayData.isWorking ? 'var(--secondary)' : 'var(--surface-container)', position: 'relative' }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: dayData.isWorking ? '23px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </button>
              </div>

              {dayData.isWorking && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {SLOTS.map(slot => (
                    <button key={slot} onClick={() => toggleSlot(day, slot)}
                      style={{
                        padding: '6px 12px', borderRadius: '8px', border: '1.5px solid',
                        borderColor: (dayData.slots || []).includes(slot) ? 'var(--secondary)' : 'var(--outline-var)',
                        background: (dayData.slots || []).includes(slot) ? 'rgba(0,106,106,0.1)' : 'transparent',
                        color: (dayData.slots || []).includes(slot) ? 'var(--secondary)' : 'var(--on-surface-var)',
                        fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                      }}>
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
