const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load models
const User = require('./models/User');
const Department = require('./models/Department');
const Ward = require('./models/Ward');
const Bed = require('./models/Bed');
const Patient = require('./models/Patient');
const Appointment = require('./models/Appointment');
const Consultation = require('./models/Consultation');
const LabOrder = require('./models/LabOrder');
const PharmacyInventory = require('./models/PharmacyInventory');
const Billing = require('./models/Billing');

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hms');
    console.log('MongoDB connected for seeding...');

    // Clear all existing data
    await User.deleteMany();
    await Department.deleteMany();
    await Ward.deleteMany();
    await Bed.deleteMany();
    await Patient.deleteMany();
    await Appointment.deleteMany();
    await Consultation.deleteMany();
    await LabOrder.deleteMany();
    await PharmacyInventory.deleteMany();
    await Billing.deleteMany();

    console.log('Cleared existing database tables.');

    // 1. Create Departments
    const depOPD = await Department.create({ name: 'Outpatient Department', type: 'OPD' });
    const depIPD = await Department.create({ name: 'Inpatient Department', type: 'IPD' });
    const depICU = await Department.create({ name: 'Intensive Care Unit', type: 'ICU' });
    const depER = await Department.create({ name: 'Emergency Room', type: 'Emergency' });
    const depLab = await Department.create({ name: 'Laboratory', type: 'Laboratory' });
    const depPharmacy = await Department.create({ name: 'Pharmacy', type: 'Pharmacy' });

    console.log('Created departments.');

    // 2. Create Users
    const users = [
      { name: 'Super Admin User', email: 'admin@apollo.com', password: 'password123', role: 'Super Admin', phone: '123-456-7890' },
      { name: 'Hospital Admin User', email: 'staff@apollo.com', password: 'password123', role: 'Hospital Admin', phone: '234-567-8901' },
      { name: 'Dr. John Smith', email: 'dr.smith@apollo.com', password: 'password123', role: 'Doctor', phone: '345-678-9012', department: 'Cardiology' },
      { name: 'Dr. Sarah Jones', email: 'dr.jones@apollo.com', password: 'password123', role: 'Doctor', phone: '456-789-0123', department: 'Pediatrics' },
      { name: 'Nurse Mary Davis', email: 'nurse@apollo.com', password: 'password123', role: 'Nurse', phone: '567-890-1234', department: 'General Ward' },
      { name: 'Technician Alex Wong', email: 'labtech@apollo.com', password: 'password123', role: 'Lab Technician', phone: '678-901-2345', department: 'Laboratory' },
      { name: 'Pharmacist Bob Miller', email: 'pharmacist@apollo.com', password: 'password123', role: 'Pharmacist', phone: '789-012-3456', department: 'Pharmacy' },
      { name: 'Patient Alice Brown', email: 'patient@apollo.com', password: 'password123', role: 'Patient', phone: '890-123-4567' }
    ];

    const seededUsers = [];
    for (const u of users) {
      const newUser = await User.create({ ...u, isVerified: true });
      seededUsers.push(newUser);
    }
    console.log('Created users with hashed passwords.');

    // Find specific roles from seeded users
    const drSmith = seededUsers.find(u => u.email === 'dr.smith@apollo.com');
    const drJones = seededUsers.find(u => u.email === 'dr.jones@apollo.com');
    const nurseMary = seededUsers.find(u => u.email === 'nurse@apollo.com');
    const techAlex = seededUsers.find(u => u.email === 'labtech@apollo.com');

    // 3. Create Wards
    const wardGeneral = await Ward.create({ name: 'General Ward A', department: depIPD._id, type: 'General' });
    const wardICU = await Ward.create({ name: 'ICU Ward B', department: depICU._id, type: 'ICU' });
    const wardPrivate = await Ward.create({ name: 'Private Suite Ward C', department: depIPD._id, type: 'Private' });

    console.log('Created wards.');

    // 4. Create Beds
    const bedsData = [
      { bedNumber: 'A-101', ward: wardGeneral._id, status: 'Available' },
      { bedNumber: 'A-102', ward: wardGeneral._id, status: 'Available' },
      { bedNumber: 'A-103', ward: wardGeneral._id, status: 'Available' },
      { bedNumber: 'ICU-201', ward: wardICU._id, status: 'Available' },
      { bedNumber: 'ICU-202', ward: wardICU._id, status: 'Under Maintenance' },
      { bedNumber: 'P-301', ward: wardPrivate._id, status: 'Available' }
    ];
    const seededBeds = await Bed.insertMany(bedsData);
    console.log('Created beds.');

    // 5. Create Patients
    // Patient 1: John Doe (OPD Patient)
    const patientJohn = await Patient.create({
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      phone: '987-654-3210',
      dob: new Date('1988-11-23'),
      gender: 'Male',
      address: '123 Main St, New York, NY',
      status: 'OPD',
      medicalHistory: [
        { condition: 'Mild seasonal allergies', diagnosedDate: new Date('2024-03-10'), notes: 'Claritin prescribed.' }
      ]
    });

    // Patient 2: Jane Smith (Admitted to Ward General Bed A-101)
    const bedA101 = seededBeds.find(b => b.bedNumber === 'A-101');
    const patientJane = await Patient.create({
      name: 'Jane Smith',
      email: 'jane.smith@gmail.com',
      phone: '876-543-2109',
      dob: new Date('1994-04-05'),
      gender: 'Female',
      address: '456 Oak St, Brooklyn, NY',
      status: 'Admitted',
      attendingDoctor: drSmith._id,
      assignedBed: bedA101._id,
      medicalHistory: [
        { condition: 'Chronic migraine', diagnosedDate: new Date('2023-08-15'), notes: 'Responds well to sumatriptan.' }
      ]
    });

    // Patient 3: Alice Brown (linked to portal login email)
    const patientAlice = await Patient.create({
      name: 'Alice Brown',
      email: 'patient@apollo.com',
      phone: '890-123-4567',
      dob: new Date('1992-06-18'),
      gender: 'Female',
      address: '789 Pine St, Manhattan, NY',
      status: 'OPD',
      medicalHistory: [
        { condition: 'Seasonal Asthma', diagnosedDate: new Date('2022-04-12'), notes: 'Albuterol inhaler.' }
      ]
    });

    // Update Bed status to Occupied and currentPatient to Jane Smith
    bedA101.status = 'Occupied';
    bedA101.currentPatient = patientJane._id;
    await bedA101.save();

    console.log('Created patients and assigned beds.');

    // 6. Create initial Vitals and Nursing notes for Jane Smith
    patientJane.vitals.push({
      temperature: '98.6',
      bloodPressure: '120/80',
      pulseRate: '72',
      spO2: '99',
      recordedBy: nurseMary._id
    });
    patientJane.nurseNotes.push({
      note: 'Patient admitted following complaints of chest pain. Monitored vitals, patient is resting comfortably.',
      recordedBy: nurseMary._id
    });
    await patientJane.save();

    // Create consultation & billing for Alice Brown
    await Consultation.create({
      patient: patientAlice._id,
      doctor: drSmith._id,
      diagnosis: 'Allergic Asthma (J45.909)',
      treatmentPlan: 'Daily inhaler usage, return if wheezing increases',
      medications: [
        { name: 'Albuterol Inhaler', dosage: '90 mcg', frequency: '2 puffs every 4 hours', duration: '30 days' }
      ],
      clinicalNotes: 'Wheezing in upper lungs. Prescribed bronchodilator.'
    });

    const billAlice = new Billing({
      patient: patientAlice._id,
      services: [
        { name: 'OPD Consultation Fee', cost: 120, quantity: 1 }
      ],
      paidAmount: 120
    });
    await billAlice.save();

    console.log('Added initial vitals, nurse logs, and Alice Brown documents.');

    // 7. Create Appointments
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await Appointment.create({
      patient: patientJohn._id,
      doctor: drSmith._id,
      date: tomorrow,
      timeSlot: 'Morning',
      status: 'Scheduled',
      type: 'Walk-in',
      reason: 'Routine cardiology follow-up'
    });

    await Appointment.create({
      patient: patientJane._id,
      doctor: drJones._id,
      date: tomorrow,
      timeSlot: 'Afternoon',
      status: 'Scheduled',
      type: 'Online',
      reason: 'Pediatric consultation for allergy management'
    });

    await Appointment.create({
      patient: patientAlice._id,
      doctor: drSmith._id,
      date: tomorrow,
      timeSlot: 'Evening',
      status: 'Scheduled',
      type: 'Online',
      reason: 'Asthma review and prescription renewal'
    });

    console.log('Created appointments.');

    // 8. Create Lab Orders
    await LabOrder.create({
      patient: patientJane._id,
      doctor: drSmith._id,
      testName: 'Complete Blood Count (CBC)',
      status: 'Pending'
    });

    await LabOrder.create({
      patient: patientAlice._id,
      doctor: drSmith._id,
      testName: 'Pulmonary Function Test (PFT)',
      status: 'Pending'
    });
    await LabOrder.create({
      patient: patientJohn._id,
      doctor: drSmith._id,
      testName: 'Lipid Profile',
      status: 'Completed',
      technician: techAlex._id,
      resultDetails: [
        { parameter: 'Total Cholesterol', value: '210', normalRange: '125 - 200', unit: 'mg/dL' },
        { parameter: 'Triglycerides', value: '145', normalRange: '30 - 150', unit: 'mg/dL' },
        { parameter: 'HDL', value: '55', normalRange: '> 40', unit: 'mg/dL' },
        { parameter: 'LDL', value: '126', normalRange: '< 100', unit: 'mg/dL' }
      ],
      remarks: 'LDL cholesterol slightly elevated. Suggest low fat diet.',
      dateCompleted: new Date()
    });

    console.log('Created lab orders.');

    // 9. Create Pharmacy Inventory
    const inventoryData = [
      { drugName: 'Amoxicillin 500mg', dosageForm: 'Capsule', stockLevel: 120, expiryDate: new Date('2027-12-01'), price: 4.5, threshold: 20 },
      { drugName: 'Paracetamol 500mg', dosageForm: 'Tablet', stockLevel: 250, expiryDate: new Date('2028-06-15'), price: 1.2, threshold: 30 },
      { drugName: 'Ibuprofen 400mg', dosageForm: 'Tablet', stockLevel: 90, expiryDate: new Date('2027-08-20'), price: 2.0, threshold: 15 },
      { drugName: 'Lipitor 10mg', dosageForm: 'Tablet', stockLevel: 8, expiryDate: new Date('2027-05-10'), price: 15.0, threshold: 10 }, // stock below threshold!
      { drugName: 'Robitussin DM Syrup', dosageForm: 'Syrup', stockLevel: 45, expiryDate: new Date('2026-11-30'), price: 9.8, threshold: 10 }
    ];
    await PharmacyInventory.insertMany(inventoryData);
    console.log('Created pharmacy inventory.');

    // 10. Create Billing for Jane Smith
    const billJane = new Billing({
      patient: patientJane._id,
      services: [
        { name: 'IPD General Ward Room Charge (1 Day)', cost: 350, quantity: 1 },
        { name: 'Cardiology Consultation Fee', cost: 150, quantity: 1 }
      ],
      paidAmount: 100, // advance payment paid
      insuranceDetails: {
        provider: 'UnitedHealthcare',
        policyNumber: 'UHC-8876543-A',
        coverageAmount: 400,
        claimStatus: 'Submitted'
      }
    });
    await billJane.save();
    console.log('Created billing records.');

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data: ', error);
    process.exit(1);
  }
};

seedData();
