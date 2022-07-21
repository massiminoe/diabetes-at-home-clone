const DbUtils = require("./dbUtils");
const Helpers = require("./clinicianHelpers");
const Patient = require("../models/patient");

const dashboard = async (req, res) => {
  const clinicianId = req.params.id;
  const thisClinician = await DbUtils.getClinicianById(clinicianId);
  const patientArray = await Helpers.getPatientsOfClinician(thisClinician);
  const todayRecords = await Helpers.getTodayRecords(patientArray);

  if (clinicianId) {
    res.render("clinician/dashboard.hbs", {
      layout: "clinician.hbs",
      clinicianId: clinicianId,
      patientData: patientArray,
      todayRecords: todayRecords,
    });
  } else {
    res.send("No id");
  }
};

const registerPatient = (req, res) => {
  const clinicianId = req.params.id;

  res.render("clinician/registerPatient.hbs", {
    layout: "clinician.hbs",
    clinicianId: clinicianId,
  });
};

const settings = (req, res) => {
  const clinicianId = req.params.id;

  res.render("clinician/settings.hbs", {
    layout: "clinician.hbs",
    clinicianId: clinicianId,
  });
};

const comments = async (req, res) => {
  const clinicianId = req.params.id;
  const thisClinician = await DbUtils.getClinicianById(clinicianId);
  const patientArray = await Helpers.getPatientsOfClinician(thisClinician);
  const commentEntries = await Helpers.getAllCommentEntries(patientArray);

  // sort commentEntries
  commentEntries.sort(function (a, b) {
    return b.date - a.date;
  });

  res.render("clinician/comments.hbs", {
    layout: "clinician.hbs",
    clinicianId: clinicianId,
    commentEntries: commentEntries,
  });
};

const patientView = async (req, res) => {
  const clinicianId = req.params.id;
  const patientId = req.params.patientId;
  const thisPatient = await DbUtils.getPatientById(patientId);

  const firstName = thisPatient.firstName;
  const lastName = thisPatient.lastName;
  const data = Helpers.getPatientRecords(thisPatient);

  res.render("clinician/patientView.hbs", {
    layout: "clinician.hbs",
    patientId: patientId,
    clinicianId: clinicianId,
    data: data,
    firstName: firstName,
    lastName: lastName,
  });
};

const setMessage =async (req, res) => {
  const clinicianId = req.params.id;
  const patientId = req.params.patientId;
  const thisPatient = await DbUtils.getPatientById(patientId);

  const firstName = thisPatient.firstName;
  const lastName = thisPatient.lastName;
  const supportMessage = thisPatient.supportMessage;

  res.render("clinician/setMessage.hbs", {
    layout: "clinician.hbs",
    patientId: patientId,
    clinicianId: clinicianId,
    firstName: firstName,
    lastName: lastName,
    supportMessage: supportMessage,
  });
};

const patientEdit = async(req, res) => {
  const clinicianId = req.params.id;
  const patientId = req.params.patientId;
  // const threshold = Helpers.getPatientThresholds(patientArray);
  const thisPatient = await DbUtils.getPatientById(patientId);
  const firstName = thisPatient.firstName;
  const lastName = thisPatient.lastName;

  const thresholds = thisPatient.thresholds;


  const glucoseMin= thresholds.glucose.min;
  const weightMin= thresholds.weight.min;
  const insulinMin= thresholds.insulin.min;
  const exerciseMin= thresholds.exercise.min;
  const glucoseMax= thresholds.glucose.max;
  const weightMax= thresholds.weight.max;
  const insulinMax= thresholds.insulin.max;
  const exerciseMax=  thresholds.exercise.max;
    
  res.render("clinician/patientEdit.hbs", {
    layout: "clinician.hbs",
    patientId: patientId,
    clinicianId: clinicianId,
    firstName: firstName,
    lastName: lastName,
     glucoseMin: thresholds.glucose.min,
     weightMin:thresholds.weight.min,
     insulinMin: thresholds.insulin.min,
     exerciseMin: thresholds.exercise.min,
     glucoseMax: thresholds.glucose.max,
     weightMax: thresholds.weight.max,
     insulinMax: thresholds.insulin.max,
     exerciseMax:thresholds.exercise.max,
  });
};
const patientNotes =async (req, res) => {
  const clinicianId = req.params.id;
  const patientId = req.params.patientId;
  const thisPatient = await DbUtils.getPatientById(patientId);
  const thisClinician = await DbUtils.getClinicianById(clinicianId);
  const notes = Helpers.getPatientNotes(thisClinician);
  

  const firstName = thisPatient.firstName;
  const lastName = thisPatient.lastName;

  res.render("clinician/patientNotes.hbs", {
    layout: "clinician.hbs",
    patientId: patientId,
    clinicianId: clinicianId,
    firstName: firstName,
    lastName: lastName,
    note: notes,
  });
};

const newPatient = (req,res) => {
  const clinicianId = req.params.id;
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const email = req.body.email;
  const password = req.body.password;
  const screenname = req.body.screenname;
  const birthday = req.body.birthday;
  const supportmessage = req.body.supportmessage;
  const bio = req.body.bio;
  const now = new Date();

  const gmin = req.body.minGlucose;
  const gmax = req.body.maxGlucose;

  const wmin = req.body.minWeight;
  const wmax = req.body.maxWeight;

  const imin = req.body.minInsulin;
  const imax = req.body.maxInsulin;

  const emin = req.body.minExercise;
  const emax = req.body.maxExercise;

  var required = [];
  var thresholds = [];

  //Create required records and thresholds
  if(gmin == '' && gmax == ''){
  }else{
    var glucose = {min: gmin, max:gmax};
    required.push("glucose")
    thresholds.push(glucose)
  };
  if(wmin == '' && wmax == ''){
  }else{
    var weight = {min: wmin, max:wmax};
    required.push("weight")
    thresholds.push(weight)
  };
  if(imin == '' && imax == ''){
  }else{
    var insulin = {min: imin, max:imax};
    required.push("insulin")
    thresholds.push(insulin)
  };
  if(emin == '' && emax == ''){
  }else{
    var exercise = {min: emin, max:emax};
    required.push("exercise")
    thresholds.push(exercise)
  };

  //create new entry
  const newEntry = {
    firstName: firstname,
    lastName: lastname,
    email: email,
    password: password,
    screenName: screenname,
    joinDate: now,
    birthday: birthday,
    supportmessage: supportmessage,
    bio: bio,
    theme: "",
    requiredRecords: {
      date: now,
      required,
    },
    thresholds: {
      glucose: glucose,
      weight: weight,
      insulin: insulin,
      exercise: exercise
    },
  };
  
  //add new entry to collection
  Patient.create(newEntry,function(err, res){});
  

  res.redirect("/clinician/" + clinicianId + "/dashboard");

};

const saveTheme = async (req, res) => {
  const clinicianId = req.params.id;
  const selectedTheme = req.params.theme;

  const clinician = await DbUtils.getClinicianById(clinicianId);

  await Clinician.updateOne(
    { _id: clinician._id },
    { $set: { theme: selectedTheme } }
  );
  
  // Redirect back to the page.
  res.redirect("/clinician/" + clinicianId + "/settings");

}

const getTheme = async (req, res) => {
  const clinicianId = req.params.id;

  const clinician = await DbUtils.getClinicianById(clinicianId);  
  
  res.json({ theme: clinician.theme });
};

module.exports = {
  dashboard,
  registerPatient,
  settings,
  comments,
  patientEdit,
  patientNotes,
  patientView,
  setMessage,
  newPatient,
  getTheme,
  saveTheme,  
};
