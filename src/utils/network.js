import { hideSpinner, showSpinner } from "./context"

const SERVERPORT = process.env.REACT_APP_SERVER_PORT
export const SERVER = process.env.REACT_APP_SERVER + SERVERPORT

// * --------------------------------------------------------------------------------------------------
// * -------------------------------------- Main Send Module ------------------------------------------

const _send = (module) => {
	return new Promise((resolve, reject) => {
		const data = {
			method: module.method || "POST", // defaults to POST if not explicitly stated
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ ...module.data, sender: "doctor" }) || null,
		}

		const { spinner, dispatch } = module
		spinner && showSpinner(dispatch, { text: spinner.text, fullMode: spinner.fullMode, lightFont: spinner.lightFont })

		fetch(SERVER + "/" + module.module, data)
			.then((res) => {
				dispatch && hideSpinner(dispatch)
				return res.json()
			})
			.then((data) => resolve(data))
			.catch((error) => {
				dispatch && hideSpinner(dispatch)
				reject(error)
			})
	})
}

// * --------------------------------------------------------------------------------------------------

export const doctor_auth = (dispatch, email, password) => {
	/**
	 * @returns status "OK"/profile array (as result.status/result.msg) or error status/msg
	 */

	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: {
				text: "Logging in...",
				fullMode: true,
				lightFont: true,
			},
			module: "doctor_auth",
			data: {
				email: email.toLowerCase(),
				password,
			},
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const common_loadGlobalSettings = (dispatch) => {
	/**
	 * @returns status "OK"/profile array (as result.status/result.msg) or error status/msg
	 */

	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Loading settings" },
			module: "common_loadGlobalSettings",
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const doctor_setGlobalSettings = (dispatch, settings) => {
	/**
	 * @returns status "OK"/profile array (as result.status/result.msg) or error status/msg
	 */

	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Saving settings" },
			module: "doctor_setGlobalSettings",
			data: { settings },
		})
			.then((result) => (result.status === "OK" ? resolve(result.status) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const doctor_saveDoctor = (dispatch, doctor) => {
	/**
	 * @returns status "OK"/profile array (as result.status/result.msg) or error status/msg
	 */

	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Saving doctor's profile" },
			module: "doctor_saveDoctor",
			data: { doctor },
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const doctor_loadAppointments2 = (dispatch, doctor_id, from, to) => {
	/**
	 * @returns status "OK"/appointments array (as result.status/result.msg) or error status/msg
	 */

	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Loading appointments" },
			module: "doctor_loadAppointments2",
			data: { doctor_id, from, to },
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const doctor_setOnlineAppointment = (dispatch, appointment) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Setting appointment" },
			module: "doctor_setOnlineAppointment",
			data: appointment,
		})
			.then((result) => (result.status === "OK" ? resolve(result.status) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const doctor_cancelAppointment = (dispatch, _id) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Cancelling appointment" },
			module: "doctor_cancelAppointment",
			data: { _id },
		})
			.then((result) => (result.status === "OK" ? resolve(result.status) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const doctor_loadConsultation = (dispatch, doctor_appointment_id) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Loading consultation" },
			module: "doctor_loadConsultation",
			data: { doctor_appointment_id },
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const doctor_startAppointmentNow = (dispatch, _id, startTime, patient_appointment_id) => {
	// * startTime is specified by client to ensure that the timing is synchronised with server
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Starting appointment" },
			module: "doctor_startAppointmentNow",
			data: { _id, startTime, patient_appointment_id },
		})
			.then((result) => (result.status === "OK" ? resolve(result.status) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const doctor_changeAppointmentStatus = (dispatch, _id, status) => {
	return new Promise((resolve, reject) => {
		_send({
			module: "doctor_changeAppointmentStatus",
			data: { _id, status },
		})
			.then((result) => (result.status === "OK" ? resolve(result.status) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const doctor_closeConsultation = (dispatch, appointment_id) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Closing consultation" },
			module: "doctor_closeConsultation",
			data: { appointment_id },
		})
			.then((result) => (result.status === "OK" ? resolve(result.status) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const doctor_modifySessionEndTime = (dispatch, _id, endTime, text, endSession) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text },
			module: "doctor_modifySessionEndTime",
			data: { _id, endTime, endSession },
		})
			.then((result) => (result.status === "OK" ? resolve(result.status) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

/* export const doctor_getAppointmentDetails = (dispatch, appointment_id) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			module: "doctor_getAppointmentDetails",
			data: { appointment_id },
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
} */

export const doctor_getDoctors = (dispatch) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Loading doctor's list", fullMode: true },
			module: "doctor_getDoctors",
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const doctor_getDoctorAppointment = (dispatch, doctor_id) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Loading doctor's appointments" },
			module: "doctor_getDoctorAppointment",
			data: { doctor_id },
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const doctor_acceptMissedAppointment = (dispatch, data) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Accepting missed appointment" },
			module: "doctor_acceptMissedAppointment",
			data,
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const doctor_assignMissedAppointment = (dispatch, data) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Assigning missed appointment" },
			module: "doctor_assignMissedAppointment",
			data,
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const doctor_extendSessionTime = (dispatch, appointment_id, minutes) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Extending session" },
			module: "doctor_extendSessionTime",
			data: { appointment_id, minutes },
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const doctor_checkSessionExtendable = (dispatch, appointment_id) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Checking for available extension", lightFont: true },
			module: "doctor_checkSessionExtendable",
			data: { appointment_id },
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const doctor_changePassword = (dispatch, _id, currentPassword, newPassword) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Changing password" },
			module: "doctor_changePassword",
			data: {
				_id,
				currentPassword,
				newPassword,
			},
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const doctor_getPatientsHistory = (dispatch, patient_id) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Loading patient's history" },
			module: "doctor_getPatientsHistory",
			data: { patient_id },
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const doctor_getPatientsDetails = (dispatch, patient_id) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Loading patient's details" },
			module: "doctor_getPatientsDetails",
			data: { patient_id },
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

/* export const doctor_getClinicDetails = (dispatch, clinic_id) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			module: "doctor_getClinicDetails",
			data: { clinic_id },
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
} */

export const doctor_saveNotes = (dispatch, note) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Saving notes" },
			module: "doctor_saveNotes",
			data: { note },
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const doctor_savePrescription = (dispatch, prescription) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Saving prescription" },
			module: "doctor_savePrescription",
			data: { ...prescription },
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const doctor_deletePrescription = (dispatch, patient_appointment_id) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Deleting prescription" },
			module: "doctor_deletePrescription",
			data: { patient_appointment_id },
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const doctor_removeMedicationFromPrescription = (dispatch, patient_appointment_id, medication_id) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Removing medication" },
			module: "doctor_removeMedicationFromPrescription",
			data: { patient_appointment_id, medication_id },
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const doctor_getPatientsList = (dispatch, doctor_id) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Loading patient's list" },
			module: "doctor_getPatientsList",
			data: { doctor_id },
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const doctor_getConsultationDetails = (dispatch, patient_appointment_id) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Loading consultation details" },
			module: "doctor_getConsultationDetails",
			data: { patient_appointment_id },
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const doctor_switchToAudioMode = (patient_id) => {
	// * Note : This is used instead of socket.emit as Swal2.onDeny blocked the subsequent socket emitters
	return new Promise((resolve, reject) => {
		_send({
			module: "doctor_switchToAudioMode",
			data: { patient_id },
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const doctor_getNews = (dispatch, page) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Loading news" },
			module: "doctor_getNews",
			data: { page },
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const common_downloadMessages = (dispatch, id) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Loading messages" },
			module: "common_downloadMessages",
			data: { id },
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const common_sendMessage = (dispatch, message) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Sending message" },
			module: "common_sendMessage",
			data: { message },
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const common_updateReadStatus = (dispatch, message_id, status) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Updating status" },
			module: "common_updateReadStatus",
			data: { message_id, status },
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const common_deleteDraftMessage = (dispatch, message_id) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Deleting draft" },
			module: "common_deleteDraftMessage",
			data: { message_id },
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}
