const Utils = require("./utils");
const DbUtils = require("./dbUtils");
const dataDisplayNames = require("../models/dataDisplayNames");
const Clinician = require("../models/clinician");


const getPatientsOfClinician = async (thisClinician) => {
  let patientIdArray = Utils.getPatientIds(thisClinician);
  let patientArray = [];
  for (let i = 0; i < patientIdArray.length; i++) {
    const thisPatient = await DbUtils.getPatientById(patientIdArray[i]);
    //console.log(thisPatient);
    patientArray.push(thisPatient);
  }
  //console.log(patientArray)
  return patientArray;
};

const getPatientNotes = async(clinician)=>{
  
  let notesArray =[];

  notesLength = clinician.patients.length;

  for (let i = notesLength-1; i>=0; i--){
    const thisNote = clinician.patients[i].notes;
    const thisDate = thisNote.date;
    let noteFormatt = {
      date: thisNote.note,
      note: thisDate,
    }
    notesArray.push(noteFormatt);
  }
  return notesArray;
};


const setNewMessage = async(patient) =>{

}


// Takes all patient data and formats it into relevant data
// Output is used to display patient data on clinician/dashboard.hbs
const getTodayRecords = async (patientArray) => {
  const todayDate = new Date();
  let todayRecords = [];
  //console.log(patientArray)
  for (let i = 0; i < patientArray.length; i++) {
    const thisPatient = await DbUtils.getPatientById(patientArray[i]._id);
    const thisPatientRecord = thisPatient.records.slice(-1)[0];
    const thisPatientData = thisPatientRecord.data;
    //console.log(thisPatientData);
    const thisPatientRequiredRecords = Utils.getRequired(
      thisPatient.requiredRecords
    );
    let dataFormatted = {
      patientId: thisPatient._id,
      firstName: thisPatient.firstName,
      lastName: thisPatient.lastName,
      glucose: "N/A",
      weight: "N/A",
      insulin: "N/A",
      exercise: "N/A",
      glucoseOutThresh: false,
      weightOutThresh: false,
      insulinOutThresh: false,
      exerciseThresh: false,
    };
    // marking required records that are not recorded yet.
    for (let k = 0; k < thisPatientRequiredRecords.length; k++) {
      dataFormatted[thisPatientRequiredRecords[k]] = "---";
    }
    // inputing data fields and determining if it is out of threshold.
    for (let j = 0; j < thisPatientData.length; j++) {
      if (Utils.checkSameDay(thisPatientRecord.date, todayDate)) {
        //console.log("+++" + thisPatientData[j].attribute);
        let value = -1;
        let thresholds = thisPatient.thresholds;
        switch (thisPatientData[j].attribute) {
          case "glucose":
            dataFormatted.glucose = thisPatientData[j].value;
            value = thisPatientData[j].value;
            dataFormatted.glucoseOutThresh =
              value < thresholds.glucose.min || value > thresholds.glucose.max;
            break;
          case "weight":
            dataFormatted.weight = thisPatientData[j].value;
            value = thisPatientData[j].value;
            dataFormatted.weightOutThresh =
              value < thresholds.weight.min || value > thresholds.weight.max;
            break;
          case "insulin":
            dataFormatted.insulin = thisPatientData[j].value;
            value = thisPatientData[j].value;
            dataFormatted.insulinOutThresh =
              value < thresholds.insulin.min || value > thresholds.insulin.max;
            break;
          case "exercise":
            dataFormatted.exercise = thisPatientData[j].value;
            value = thisPatientData[j].value;
            dataFormatted.exerciseOutThresh =
              value < thresholds.exercise.min ||
              value > thresholds.exercise.max;
            break;
        }
      }
    }
    todayRecords.push(dataFormatted);
  }
  //console.log(todayRecords);
  return todayRecords;
};

// Get all comments and supporting data from an array of patients for /clinician/:id/comments. Comments older than maxAge days are ignored
const getAllCommentEntries = async (patientArray, maxAge = 7) => {
  const now = new Date();
  let entries = [];

  for (let patient of patientArray) {
    recentRecords = patient.records.slice(-1 * maxAge);
    let patientName = patient.firstName.concat(" ", patient.lastName);

    for (let record of recentRecords) {
      if (Utils.getDayDiff(now, record.date) > maxAge) continue; // Records too old

      for (let data of record.data) {
        if (data.comment) {
          // Create entry object
          let newEntry = {
            patientId: patient._id,
            name: patientName,
            data: dataDisplayNames[data.attribute],
            value: data.value,
            date: data.datetime,
            dateString: Utils.dateToDisplay(data.datetime),
            comment: data.comment,
          };
          entries.push(newEntry);
        }
      }
    }
  }

  return entries;
};



const getPatientRecords = (patient) => {
  const datalength = patient.records.length;
  let data = [];

  for (let i = datalength - 1; i >= 0; i--) {
    const thisRecord = patient.records[i].data;
    const required = Utils.getRequired(patient.requiredRecords);

    const thisRecordDate = patient.records[i].date.toDateString();

    let dataformatted = {
      date: thisRecordDate,
      glucose: "N/A",
      weight: "N/A",
      insulin: "N/A",
      exercise: "N/A",
      glucoseOutThresh: false,
      weightOutThresh: false,
      insulinOutThresh: false,
      exerciseThresh: false,
    };

    for (let j = 0; j < required.length; j++) {
      dataformatted[required[j]] = "---";
    }

    for (let j = 0; j < thisRecord.length; j++) {
      const thisEntry = thisRecord[j];
      dataformatted[thisEntry.attribute] = thisEntry.value;
      switch (thisEntry.attribute) {
        case "glucose":
          dataformatted.glucoseOutThresh =
            thisEntry.value < patient.thresholds.glucose.min ||
            thisEntry.value > patient.thresholds.glucose.max;
          break;
        case "weight":
          dataformatted.weightOutThresh =
            thisEntry.value < patient.thresholds.weight.min ||
            thisEntry.value > patient.thresholds.weight.max;
          break;
        case "insulin":
          dataformatted.insulinOutThresh =
            thisEntry.value < patient.thresholds.insulin.min ||
            thisEntry.value > patient.thresholds.insulin.max;
          break;
        case "exercise":
          dataformatted.exerciseOutThresh =
            thisEntry.value < patient.thresholds.exercise.min ||
            thisEntry.value > patient.thresholds.exercise.max;
          break;
      }
    }

    data.push(dataformatted);
  }
  return data;
};

module.exports = {
  getPatientsOfClinician,
  getTodayRecords,
  getAllCommentEntries,
  getPatientRecords,
  getPatientNotes,
};
