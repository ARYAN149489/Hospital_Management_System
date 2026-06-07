// backend/services/prescription.service.js
const Prescription = require('../models/Prescription.model');
const Doctor = require('../models/Doctor.model');
const Patient = require('../models/Patient.model');
const Appointment = require('../models/Appointment.model');
const Notification = require('../models/Notification.model');
const AppError = require('../utils/appError');
const emailService = require('../utils/emailService');

class PrescriptionService {
  async createPrescription(userId, prescriptionData) {
    const doctor = await Doctor.findOne({ user: userId }).populate('user');
    if (!doctor) {
      throw new AppError('Doctor profile not found', 404);
    }

    const {
      patientId,
      appointmentId,
      diagnosis,
      chiefComplaints,
      vitalSigns,
      medications,
      labTests,
      advice,
      dietaryAdvice,
      followUp,
      validUntil
    } = prescriptionData;

    // Verify patient exists
    const patient = await Patient.findById(patientId).populate('user');
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    // Verify doctor can only prescribe to patients with a completed appointment in the last 14 days
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const completedAppointment = await Appointment.findOne({
      doctor: doctor._id,
      patient: patientId,
      status: 'completed',
      appointmentDate: { $gte: fourteenDaysAgo }
    });

    if (!completedAppointment) {
      throw new AppError('Prescriptions can only be created for patients who have completed an appointment with you within the last 14 days', 400);
    }

    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        throw new AppError('Appointment not found', 404);
      }

      if (!appointment.doctor.equals(doctor._id)) {
        throw new AppError('This appointment does not belong to you', 403);
      }

      // Verify appointment date has passed
      const appointmentDateTime = new Date(appointment.appointmentDate);
      const [hours, minutes] = appointment.appointmentTime.split(':').map(Number);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      const now = new Date();
      if (appointmentDateTime > now) {
        throw new AppError('Prescription can only be created after the appointment time has passed', 400);
      }
    }

    // Generate unique prescription ID
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const count = await Prescription.countDocuments();
    const prescriptionId = `RX${dateStr}-${String(count + 1).padStart(4, '0')}`;

    const prescription = await Prescription.create({
      prescriptionId,
      patient: patientId,
      doctor: doctor._id,
      appointment: appointmentId,
      diagnosis,
      chiefComplaints,
      vitalSigns,
      medications,
      labTests,
      advice,
      dietaryAdvice,
      followUp,
      validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    // Link prescription in appointment
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, {
        prescription: prescription._id
      });
    }

    // Create Notification
    if (patient.user) {
      const docName = doctor.user ? `${doctor.user.firstName} ${doctor.user.lastName}` : 'your doctor';
      await Notification.create({
        recipient: patient.user._id,
        type: 'prescription_added',
        title: 'New Prescription Added',
        message: `Dr. ${docName} has added a new prescription for you.`,
        relatedEntity: {
          entityType: 'prescription',
          entityId: prescription._id
        }
      });
    }

    // Send email
    try {
      if (patient.user && patient.user.email) {
        emailService.sendPrescriptionEmail(patient.user.email, prescription).catch(err => {
          console.error('⚠️ Failed to send prescription email:', err.message);
        });
      }
    } catch (err) {
      console.error('⚠️ Synchronous failure when invoking sendPrescriptionEmail:', err.message);
    }

    return prescription;
  }
}

module.exports = new PrescriptionService();
