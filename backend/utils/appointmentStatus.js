// backend/utils/appointmentStatus.js
const Appointment = require('../models/Appointment.model');

/**
 * Check if appointment time has passed
 * @param {Date} appointmentDate - The appointment date
 * @param {String} appointmentTime - The appointment time in format "HH:MM"
 * @returns {Boolean} - True if appointment time has passed
 */
const hasAppointmentTimePassed = (appointmentDate, appointmentTime) => {
  try {
    if (!appointmentDate || !appointmentTime) {
      console.warn('Missing appointmentDate or appointmentTime');
      return false;
    }

    const now = new Date();
    const [hours, minutes] = appointmentTime.split(':');
    
    if (!hours || !minutes) {
      console.warn('Invalid appointmentTime format:', appointmentTime);
      return false;
    }
    
    const appointmentDateTime = new Date(appointmentDate);
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const result = now > appointmentDateTime;
    console.log('⏰ Time comparison:', {
      now: now.toISOString(),
      appointmentDate: appointmentDate,
      appointmentDateTime: appointmentDateTime.toISOString(),
      appointmentTime,
      timePassed: result
    });
    
    return result;
  } catch (error) {
    console.error('Error in hasAppointmentTimePassed:', error);
    return false;
  }
};

/**
 * Update expired appointments based on their status
 * - Confirmed appointments -> completed
 * - Scheduled/pending appointments -> cancelled
 * @param {Array} appointments - Array of appointments to check
 * @returns {Array} - Updated appointments
 */
const updateExpiredAppointments = async (appointments) => {
  const updatedAppointments = [];
  const bulkOps = [];

  try {
    for (const appointment of appointments) {
      // Skip if appointment doesn't have required fields
      if (!appointment || !appointment.appointmentDate || !appointment.appointmentTime) {
        console.warn('Skipping appointment with missing fields:', appointment?._id);
        updatedAppointments.push(appointment);
        continue;
      }

      const timePassed = hasAppointmentTimePassed(
        appointment.appointmentDate,
        appointment.appointmentTime
      );

      let needsUpdate = false;
      let newStatus = appointment.status;

      if (timePassed) {
        console.log('🔴 Appointment time has passed:', appointment._id, 'Status:', appointment.status);
        // If confirmed and time passed -> mark as completed
        if (appointment.status === 'confirmed') {
          newStatus = 'completed';
          needsUpdate = true;
          console.log('   → Marking as completed');
        }
        // If scheduled (pending/not confirmed) and time passed -> mark as cancelled
        else if (appointment.status === 'scheduled') {
          newStatus = 'cancelled';
          needsUpdate = true;
          console.log('   → Marking as cancelled');
        }
      } else {
        console.log('🟢 Appointment is upcoming:', appointment._id, 'Status:', appointment.status);
      }

      if (needsUpdate) {
        bulkOps.push({
          updateOne: {
            filter: { _id: appointment._id },
            update: { 
              status: newStatus,
              ...(newStatus === 'cancelled' && {
                cancellationReason: 'Appointment time has passed without confirmation',
                cancelledBy: 'system',
                cancelledAt: new Date()
              })
            }
          }
        });

        // Update the appointment object for immediate return
        appointment.status = newStatus;
        if (newStatus === 'cancelled') {
          appointment.cancellationReason = 'Appointment time has passed without confirmation';
          appointment.cancelledBy = 'system';
          appointment.cancelledAt = new Date();
        }
      }

      updatedAppointments.push(appointment);
    }

    // Perform bulk update if needed
    if (bulkOps.length > 0) {
      await Appointment.bulkWrite(bulkOps);
      console.log(`✅ Updated ${bulkOps.length} expired appointments`);
    }

    return updatedAppointments;
  } catch (error) {
    console.error('Error in updateExpiredAppointments:', error);
    // Return original appointments if update fails
    return appointments;
  }
};

/**
 * Get appointment status summary
 * @param {Date} appointmentDate - The appointment date
 * @param {String} appointmentTime - The appointment time
 * @param {String} currentStatus - Current appointment status
 * @returns {Object} - Status info
 */
const getAppointmentStatusInfo = (appointmentDate, appointmentTime, currentStatus) => {
  const timePassed = hasAppointmentTimePassed(appointmentDate, appointmentTime);
  
  return {
    timePassed,
    shouldBeCompleted: currentStatus === 'confirmed' && timePassed,
    shouldBeCancelled: currentStatus === 'scheduled' && timePassed,
    isUpcoming: !timePassed && ['scheduled', 'confirmed'].includes(currentStatus),
    isPast: timePassed || ['completed', 'cancelled', 'no-show'].includes(currentStatus)
  };
};

module.exports = {
  hasAppointmentTimePassed,
  updateExpiredAppointments,
  getAppointmentStatusInfo
};
