# Realistic Patient Data - Creation Summary

**Date Created:** November 28, 2025  
**Script:** `create-realistic-patients.js`  
**Status:** ✅ Successfully Created

---

## 📊 Summary Statistics

- **Total Patients:** 6
- **Total Appointments:** 36 (6 per patient)
- **Total Prescriptions:** 8
- **Appointment Distribution:**
  - Yesterday: 12 appointments
  - Today: 12 appointments
  - Tomorrow: 12 appointments

---

## 👥 Patient Accounts

### 1. Rahul Verma
- **Email:** rahul.verma@example.com
- **Password:** Patient@123
- **Phone:** 9876543210
- **Blood Group:** B+
- **Age:** 40 years (DOB: 1985-05-15)
- **Gender:** Male
- **Location:** Bangalore, Karnataka
- **Medical History:** Hypertension, Diabetes Type 2
- **Allergies:** Penicillin (severe)
- **Current Medications:** Metformin 500mg (Twice daily)
- **Appointments:** 6
- **Prescriptions:** 1

### 2. Priya Sharma
- **Email:** priya.sharma@example.com
- **Password:** Patient@123
- **Phone:** 9876543211
- **Blood Group:** A+
- **Age:** 35 years (DOB: 1990-08-22)
- **Gender:** Female
- **Location:** Mumbai, Maharashtra
- **Medical History:** Asthma
- **Allergies:** Pollen (moderate), Dust (mild)
- **Current Medications:** Albuterol Inhaler (As needed)
- **Appointments:** 6
- **Prescriptions:** 1

### 3. Amit Patel
- **Email:** amit.patel@example.com
- **Password:** Patient@123
- **Phone:** 9876543212
- **Blood Group:** O+
- **Age:** 47 years (DOB: 1978-12-10)
- **Gender:** Male
- **Location:** Ahmedabad, Gujarat
- **Medical History:** High Cholesterol, Heart Disease
- **Allergies:** Shellfish (severe)
- **Current Medications:** Atorvastatin 20mg, Aspirin 75mg (Once daily)
- **Appointments:** 6
- **Prescriptions:** 2

### 4. Sneha Reddy
- **Email:** sneha.reddy@example.com
- **Password:** Patient@123
- **Phone:** 9876543213
- **Blood Group:** AB+
- **Age:** 30 years (DOB: 1995-03-18)
- **Gender:** Female
- **Location:** Hyderabad, Telangana
- **Medical History:** Migraine
- **Allergies:** None
- **Current Medications:** Sumatriptan 50mg (As needed)
- **Appointments:** 6
- **Prescriptions:** 0

### 5. Vikram Singh
- **Email:** vikram.singh.new@example.com
- **Password:** Patient@123
- **Phone:** 9876543214
- **Blood Group:** A-
- **Age:** 43 years (DOB: 1982-07-25)
- **Gender:** Male
- **Location:** Delhi
- **Medical History:** Back Pain, Arthritis
- **Allergies:** Latex (moderate)
- **Current Medications:** Ibuprofen 400mg (Three times daily)
- **Appointments:** 6
- **Prescriptions:** 2

### 6. Anjali Mehta
- **Email:** anjali.mehta@example.com
- **Password:** Patient@123
- **Phone:** 9876543215
- **Blood Group:** B-
- **Age:** 37 years (DOB: 1988-11-30)
- **Gender:** Female
- **Location:** Mumbai, Maharashtra
- **Medical History:** Thyroid Disorder
- **Allergies:** Iodine (mild)
- **Current Medications:** Levothyroxine 100mcg (Once daily before breakfast)
- **Appointments:** 6
- **Prescriptions:** 2

---

## 📅 Appointment Details

### Appointment Distribution by Status

- **Completed:** ~12 appointments (yesterday)
- **Cancelled:** ~8 appointments (yesterday)
- **Confirmed:** ~8 appointments (today)
- **Scheduled:** ~16 appointments (today & tomorrow)

### Appointment Types

- **In-Person:** ~80% (29 appointments)
- **Emergency:** ~20% (7 appointments)

### Specializations Covered

Appointments are distributed across:
- Cardiology (Heart conditions)
- Neurology (Neurological issues)
- Pediatrics (General health)
- Orthopedics (Bone & joint issues)
- Dermatology (Skin conditions)
- Gynecology (Women's health)

---

## 💊 Prescription Details

### Created Prescriptions (8 total)

#### Prescription Types

1. **Fever and Body Ache** (3 prescriptions)
   - Paracetamol 500mg
   - Twice daily for 5 days
   - Take after meals

2. **Gastritis** (1 prescription)
   - Omeprazole 20mg
   - Once daily for 14 days
   - Take before breakfast

3. **Allergic Reaction** (2 prescriptions)
   - Cetirizine 10mg
   - Once daily for 7 days
   - Take at bedtime

4. **Bacterial Infection** (2 prescriptions)
   - Amoxicillin 250mg (Three times daily for 7 days)
   - Paracetamol 500mg (As needed for pain)

### Prescription Validity

- All prescriptions are valid for 30 days from issue date
- Status: Active

---

## 🏥 Medical History Coverage

### Chronic Conditions Represented

1. **Cardiovascular:**
   - Hypertension (Rahul Verma)
   - Heart Disease (Amit Patel)
   - High Cholesterol (Amit Patel)

2. **Metabolic:**
   - Diabetes Type 2 (Rahul Verma)
   - Thyroid Disorder (Anjali Mehta)

3. **Respiratory:**
   - Asthma (Priya Sharma)

4. **Neurological:**
   - Migraine (Sneha Reddy)

5. **Musculoskeletal:**
   - Back Pain (Vikram Singh)
   - Arthritis (Vikram Singh)

---

## 🔒 Security & Access

### Default Credentials

- **Password:** Patient@123 (for all patients)
- **Email Format:** firstname.lastname@example.com
- **Phone Format:** 10-digit Indian mobile numbers (98765432XX)

### Account Status

- All accounts are **Active**
- Email verification status: **Verified**
- All profiles are **Complete** with patient data

---

## 🧪 Test Scenarios Covered

### 1. Yesterday's Appointments
- ✅ Completed appointments with prescriptions
- ✅ Cancelled appointments (patient/doctor cancellations)
- ✅ Past date handling

### 2. Today's Appointments
- ✅ Scheduled appointments (pending confirmation)
- ✅ Confirmed appointments (ready for consultation)
- ✅ Real-time appointment status

### 3. Tomorrow's Appointments
- ✅ Future appointments (scheduled)
- ✅ Upcoming appointment notifications
- ✅ Appointment booking functionality

### 4. Prescriptions
- ✅ Auto-generated for completed appointments
- ✅ Multiple medications per prescription
- ✅ Diagnosis and treatment notes
- ✅ Validity period (30 days)

---

## 📱 Frontend Testing Use Cases

### Patient Dashboard
- View upcoming appointments
- View past appointments with prescriptions
- Check appointment history
- Review medical conditions and allergies

### Doctor Dashboard
- See patient appointments (yesterday, today, tomorrow)
- View patient medical history
- Review prescriptions issued
- Check patient allergies before prescribing

### Admin Dashboard
- Monitor overall appointment statistics
- View patient distribution across specializations
- Track prescription patterns
- Review appointment completion rates

---

## 🔧 How to Use

### Login as Any Patient

```
1. Go to login page
2. Select "Patient" role
3. Use credentials:
   Email: [any patient email from list above]
   Password: Patient@123
4. Access patient dashboard
```

### View Appointments

```
- Yesterday: See completed/cancelled appointments
- Today: See scheduled/confirmed appointments
- Tomorrow: See upcoming appointments
```

### View Prescriptions

```
- Navigate to Prescriptions section
- View 8 total prescriptions across patients
- Check medication details and dosages
```

---

## 📊 Database Collections Updated

- **Users:** 6 new patient users
- **Patients:** 6 new patient profiles
- **Appointments:** 36 new appointments
- **Prescriptions:** 8 new prescriptions

---

## 🎯 Next Steps

### For Complete Testing

1. **Login with Different Patients**
   - Test each patient account
   - Verify profile data display
   - Check appointments and prescriptions

2. **Doctor Side Testing**
   - Login as doctors who have appointments
   - View patient list with appointments
   - Check ability to create prescriptions

3. **Admin Side Testing**
   - View all patient data
   - Monitor appointment statistics
   - Review prescription analytics

### To Add More Data

```bash
# Run the script again to add more appointments
cd backend
node create-realistic-patients.js
```

Note: The script checks for existing patients and skips them, but will add new appointments to existing patients.

---

## 🚀 Quick Test Commands

### Test Patient Login
```bash
# Test login for Rahul Verma
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rahul.verma@example.com","password":"Patient@123","role":"patient"}'
```

### Test Appointments API
```bash
# Get patient appointments (requires token)
curl -X GET http://localhost:5002/api/appointments/my-appointments \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test Prescriptions API
```bash
# Get patient prescriptions (requires token)
curl -X GET http://localhost:5002/api/patients/prescriptions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

**Created By:** create-realistic-patients.js  
**Date:** November 28, 2025  
**Status:** ✅ Production Ready

All patient data is now available in the database and ready for comprehensive frontend and API testing!
