import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';

function toPKT(datetime) {
  try {
    const date = new Date(datetime);
    return date.toLocaleString('en-GB', { timeZone: 'Asia/Karachi' });
  } catch {
    return datetime;
  }
}

export default function Admin() {
  const loggedUser = JSON.parse(localStorage.getItem('loggedUser') || 'null');
  if (!loggedUser || loggedUser.user_type !== 'doctor') {
    return <div className="alert alert-danger">Access denied. Only doctors can view this page.</div>;
  }

  const [appointments, setAppointments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [newSchedule, setNewSchedule] = useState({ date: '', day_of_week: '', start_time: '', end_time: '' });
  const [loading, setLoading] = useState(true);
  const dataLoadedRef = useRef(false);

  useEffect(() => {
    if (!dataLoadedRef.current) {
      dataLoadedRef.current = true;
      setLoading(true);
      
      Promise.all([
        api.get('/appointments/doctor/')
          .then(response => {
            setAppointments(response.data);
            return response.data;
          })
          .catch(err => {
            console.error('Error fetching appointments:', err);
            return [];
          }),
        api.get('/schedules/')
          .then(response => {
            setSchedules(response.data);
            return response.data;
          })
          .catch(err => {
            console.error('Error fetching schedule:', err);
            return [];
          })
      ])
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
    }
  }, []);

  const pending = appointments.filter(a => a.status === 'pending');
  const accepted = appointments.filter(a => a.status === 'accepted');

  function respond(id, status) {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  }

  function startMeeting(id) {
    const now = new Date().toISOString();
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, start_time: now } : a));
  }

  function endMeeting(id) {
    const now = new Date().toISOString();
    setAppointments(prev => prev.map(a => {
      if (a.id === id && a.start_time) {
        const duration = Math.round((new Date(now) - new Date(a.start_time)) / 1000 / 60);
        return { ...a, end_time: now, duration, status: 'completed' };
      }
      return a;
    }));
  }

  function handleAddSchedule(e) {
    e.preventDefault();
    
    // Format the request body according to DoctorScheduleCreateSerializer
    const scheduleData = {
      date: newSchedule.date,
      day_of_week: newSchedule.day_of_week,
      start_time: newSchedule.start_time,
      end_time: newSchedule.end_time
    };
    
    api.post('/schedules/set/', scheduleData)
      .then(response => {
        // Response structure: { message, schedule: { ... } }
        setSchedules(prev => [...prev, response.data.schedule]);
        setNewSchedule({ date: '', day_of_week: '', start_time: '', end_time: '' });
        alert('Schedule added successfully!');
      })
      .catch(err => {
        console.error('Error adding schedule:', err);
        alert('Failed to add schedule.');
      });
  }

  function deleteSchedule(id) {
    api.delete(`/schedules/${id}/`)
      .then(() => {
        // Response: 204 NO_CONTENT (no data in response)
        setSchedules(prev => prev.filter(s => s.id !== id));
        alert('Schedule deleted successfully!');
      })
      .catch(err => {
        console.error('Error deleting schedule:', err);
        alert('Failed to delete schedule.');
      });
  }

  useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [appointments]);

  return (
    <main className="container">
      {loading ? (
        <div className="text-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading your schedule...</p>
        </div>
      ) : (
        <>
          <h2>My Schedule — {loggedUser.first_name} </h2>

          <section className="mt-5">
            <h3>Manage Schedule</h3>
            <div className="mb-3">
              <h5>Add New Schedule</h5>
              <form onSubmit={handleAddSchedule} className="row g-3">
                <div className="col-md-4">
                  <label htmlFor="date" className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    id="date"
                    value={newSchedule.date}
                    onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-2">
                  <label htmlFor="day_of_week" className="form-label">Day of Week</label>
                  <select
                    className="form-select"
                    id="day_of_week"
                    value={newSchedule.day_of_week}
                    onChange={(e) => setNewSchedule({ ...newSchedule, day_of_week: e.target.value })}
                    required
                  >
                    <option value="">Select Day</option>
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                    <option value="sunday">Sunday</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label htmlFor="start_time" className="form-label">Start Time</label>
                  <input
                    type="time"
                    className="form-control"
                    id="start_time"
                    value={newSchedule.start_time}
                    onChange={(e) => setNewSchedule({ ...newSchedule, start_time: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-2">
                  <label htmlFor="end_time" className="form-label">End Time</label>
                  <input
                    type="time"
                    className="form-control"
                    id="end_time"
                    value={newSchedule.end_time}
                    onChange={(e) => setNewSchedule({ ...newSchedule, end_time: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button type="submit" className="btn btn-primary">Add Schedule</button>
                </div>
              </form>
            </div>
            <h5>Current Schedules</h5>
            <div className="list-group">
              {schedules.length === 0 && <div className="text-muted">No schedules set</div>}
              {schedules.map(schedule => (
                <div key={schedule.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                    <strong>{schedule.day_of_week}</strong> {schedule.day_of_week.value}
                  </div>
                  <div>
                    <strong>{schedule.date}</strong> {schedule.start_time} to {schedule.end_time}
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteSchedule(schedule.id)}>Delete</button>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}