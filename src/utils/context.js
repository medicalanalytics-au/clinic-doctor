import { cloneDeep, set } from "lodash"
import { DateTime } from "luxon"
import Swal from "sweetalert2"
import { v4 as uuid } from "uuid"

// Messages
export const VIEW = {
	INBOX: "inbox",
	DRAFT: "draft",
	SENT: "sent",
}
export const MODE = {
	READ: "read",
	EDIT: "edit",
}
// ----------------

export const VIEW_ALL_ACTIVE = "All active appointments"
export const VIEW_UNCLOSED_CONSULTATIONS = "Unclosed consultations"

export const LOGIN = "LOGIN"
export const LOGOUT = "LOGOUT"

export const SET_GLOBAL_SETTINGS = "SET_GLOBAL_SETTINGS"

export const MODAL_SCREEN_ACTIVE = "MODAL_SCREEN_ACTIVE"

export const SET_SOCKETS = "SET_SOCKETS"
export const SET_STREAM = "SET_STREAM"

export const LOAD_APPOINTMENTS = "LOAD_APPOINTMENTS"
export const LOAD_PATIENTS = "LOAD_PATIENTS"
export const SET_SELECTED_MONTH = "SET_SELECTED_MONTH"
export const SET_SELECTED_YEAR = "SET_SELECTED_YEAR"

// * Dialog Queues
export const UPDATE_DIALOG_QUEUE = "UPDATE_DIALOG_QUEUE"
export const CLEAR_DIALOG_QUEUE = "CLEAR_DIALOG_QUEUE"
export const SET_ACTIVE_DIALOG = "SET_ACTIVE_DIALOG"
export const REMOVE_DIALOG = "REMOVE_DIALOG"

// * Consultation
export const CALL_STARTED = "CALL_STARTED"
export const SET_SESSION_ENDTIME = "SET_SESSION_ENDTIME"
export const SET_VIDEO_MODE = "SET_VIDEO_MODE"
export const SET_PEER_VIDEO_STREAM = "SET_PEER_VIDEO_STREAM"
export const SET_VIDEO_SCREEN_VISIBLE = "SET_VIDEO_SCREEN_VISIBLE"
export const SET_VIDEO_SCREEN_STATUS = "SET_VIDEO_SCREEN_STATUS"
export const SET_SESSION_READY = "SET_SESSION_READY"
export const SET_SESSION_PAUSED = "SET_SESSION_PAUSED"
export const START_CONSULTATION = "START_CONSULTATION"
export const SET_CONSULTATION_NOTIFICATION = "SET_CONSULTATION_NOTIFICATION"
export const SET_SHOW_DOCTORS_NOTES = "SET_SHOW_DOCTORS_NOTES"
export const SET_CONSULTATION_HISTORY = "SET_CONSULTATION_HISTORY"
export const SHOW_CONSULTATION_DETAILS = "SHOW_CONSULTATION_DETAILS"
export const SET_CONSULTATION = "SET_CONSULTATION"

// * Messages
export const SET_MESSAGES = "SET_MESSAGES"

export const OPENMESSAGE = "OPENMESSAGE"
export const CLOSEMESSAGE = "CLOSEMESSAGE"

export const SET_MESSAGE_VIEW = "SET_MESSAGE_VIEW"
export const SET_MESSAGE_MODE = "SET_MESSAGE_MODE"
export const SET_MESSAGE_RECIPIENT = "SET_MESSAGE_RECIPIENT"
// * ------

// * Snackbar
export const SHOW_SNACK = "SHOW_SNACK"
export const HIDE_SNACK = "HIDE_SNACK"
// * ------

// * Spinner
export const SHOW_SPINNER = "SHOW_SPINNER"
export const HIDE_SPINNER = "HIDE_SPINNER"
// * ------

// * Manage Doctors
export const SHOW_MANAGE_DOCTOR_SCREEN = "SHOW_MANAGE_DOCTOR_SCREEN"
export const CLOSE_MANAGE_DOCTOR_SCREEN = "CLOSE_MANAGE_DOCTOR_SCREEN"

const consultation = {
	doctor_appointment_id: "",
	patient_appointment_id: "",
	startTime: "",
	endTime: "",
	bookingDate: "",
	confirmationDate: "",
	payable: "",
	paid: "",
	// prescriptions: [],
	closed: false,
	patient: {
		patient_id: "",
		email: "",
		verified: false,
		name: "",
		sex: "",
		dob: "",
		address: "",
		contact: "",
		postalcode: "",
		state: "",
		medicalHistory: "",
		allergies: "",
		history: [],
	},
	summary: {
		text: "",
		image: null,
	},
	videoMode: false,
	// TODO ADD consultationPaused flag
}

const activeCall = {
	callStarted: false,
}

const spinner = {
	text: "",
	show: false,
	fullMode: false,
	lightFont: false,
}

export const initialState = {
	_id: null,
	loggedIn: false,
	email: null,
	verified: false,
	fullname: null,
	title: null,
	profileName: null,
	dateOfBirth: null,
	sex: null,
	qualifications: [],
	practices: [],
	specialisations: [],
	identification: null,
	languages: [],

	socket: null,
	stream: null,

	settings: {
		consultationFees: 0,
		sessionExtensionFees: 0,
		sessionStartMode: "audio",
	},

	modalScreenActive: false, // * indicate ModalScreen active status

	activeAppointments: [],
	appointments: [],
	patients: [],
	historicalYearList: [], // * for TextField select menuitem
	selectedMonth: VIEW_ALL_ACTIVE,
	selectedYear: DateTime.now().year.toString(),
	//
	// * handle dialog queues
	activeDialog: null,
	dialogs: {
		activeDialog: null,
		queue: [],
	},
	//
	// * handle socket processing queues

	sessionEndTime: null,
	peerVideoStream: null,
	videoScreenVisible: false,
	videoScreenStatus: "Not connected",
	sessionReady: false,
	consultationNotification: false,
	session: {
		sessionPaused: false,
		previousVideoScreenStatus: "",
	},
	showDoctorsNotes: false,
	history: [], // Consultation history

	showConsultationDetails: false,
	consultationDetailsId: "",

	consultation,
	activeCall,

	// * --- snackbar
	showSnack: false,
	snackMessage: "",
	// * --- snackbar

	// * --- spinner
	spinner,

	// * ---- messages
	messages: [],
	message: {
		// new: false,
		body: null,
		senderData: null,
		recipient: null,
		view: VIEW.INBOX,
		mode: MODE.READ,
		open: false,
	},
	// * ---- messages

	// * ---- Manage Doctors Screen
	showManageDoctorsScreen: false,
}

let currentState = {}

export const reducer = (state, action) => {
	/* const excludedSignals = [
		// SET_VIDEO_SCREEN_STATUS,
		SET_SELECTED_MONTH,
		SET_ACTIVE_DIALOG,
		UPDATE_DIALOG_QUEUE,
		LOAD_APPOINTMENTS,
		SHOW_SNACK,
		SET_STREAM,
		HIDE_SNACK,
		CLEAR_DIALOG_QUEUE,
		SHOW_SPINNER,
		SET_SOCKETS,
		LOGIN,
		HIDE_SPINNER,
		SET_MESSAGES,
		SET_CONSULTATION_NOTIFICATION,
		START_CONSULTATION,
	]

	excludedSignals.includes(action.type) && console.log(action.type, action.payload) */

	const refreshState = (_state) => (currentState = cloneDeep(_state))

	let returnedState

	switch (action.type) {
		case LOGIN:
			returnedState = {
				...state,
				...action.payload,
				loggedIn: true,
			}
			refreshState(returnedState)
			return returnedState

		case LOGOUT:
			returnedState = {
				...initialState,
			}

			refreshState(returnedState)
			return returnedState

		case SET_GLOBAL_SETTINGS:
			returnedState = {
				...state,
				settings: {
					consultationFees: action.payload.consultationFees,
					sessionExtensionFees: action.payload.sessionExtensionFees,
					sessionStartMode: action.payload.sessionStartMode,
				},
			}

			refreshState(returnedState)
			return returnedState

		case MODAL_SCREEN_ACTIVE:
			returnedState = {
				...state,
				modalScreenActive: action.payload,
			}

			refreshState(returnedState)
			return returnedState

		case SET_SOCKETS:
			returnedState = {
				...state,
				socket: action.payload,
			}

			refreshState(returnedState)
			return returnedState

		case SET_STREAM:
			returnedState = {
				...state,
				stream: action.payload,
			}

			refreshState(returnedState)
			return returnedState

		case LOAD_APPOINTMENTS:
			returnedState = {
				...state,
				appointments: action.payload,
			}

			refreshState(returnedState)
			return returnedState

		case LOAD_PATIENTS:
			returnedState = {
				...state,
				patients: action.payload,
			}

			refreshState(returnedState)
			return returnedState

		case SET_SELECTED_MONTH:
			returnedState = {
				...state,
				selectedMonth: action.payload,
			}

			refreshState(returnedState)
			return returnedState

		case SET_SELECTED_YEAR:
			returnedState = {
				...state,
				selectedYear: action.payload,
			}

			refreshState(returnedState)
			return returnedState

		case SET_ACTIVE_DIALOG:
			returnedState = {
				...state,
				dialogs: {
					activeDialog: action.payload,
					queue: state.dialogs.queue,
				},
			}

			refreshState(returnedState)
			return returnedState

		case UPDATE_DIALOG_QUEUE:
			returnedState = {
				...state,
				dialogs: {
					activeDialog: state.dialogs.activeDialog,
					queue: action.payload,
				},
			}

			refreshState(returnedState)
			return returnedState

		case REMOVE_DIALOG:
			returnedState = {
				...state,
				activeDialog: null,
				dialogs: action.payload,
			}

			refreshState(returnedState)
			return returnedState

		case CLEAR_DIALOG_QUEUE:
			returnedState = {
				...state,
				dialogs: {
					activeDialog: null,
					queue: [],
				},
			}

			refreshState(returnedState)
			return returnedState

		case SET_SESSION_ENDTIME:
			returnedState = set(cloneDeep(state), "consultation.endTime", action.payload)

			refreshState(returnedState)
			return returnedState

		case SET_VIDEO_MODE:
			returnedState = set(cloneDeep(state), "consultation.videoMode", action.payload)

			refreshState(returnedState)
			return returnedState

		case SET_PEER_VIDEO_STREAM:
			returnedState = {
				...state,
				peerVideoStream: action.payload,
			}

			refreshState(returnedState)
			return returnedState

		case SET_VIDEO_SCREEN_VISIBLE:
			returnedState = {
				...state,
				videoScreenVisible: action.payload,
			}

			refreshState(returnedState)
			return returnedState

		case SET_VIDEO_SCREEN_STATUS:
			returnedState = {
				...state,
				videoScreenStatus: action.payload,
			}
			refreshState(returnedState)
			return returnedState

		case CALL_STARTED:
			returnedState = set(cloneDeep(state), "activeCall.callStarted", true)
			returnedState = set(cloneDeep(returnedState), "consultation.patient.patient_id", action.payload)
			refreshState(returnedState)
			return returnedState

		case SET_SESSION_READY:
			returnedState = {
				...state,
				sessionReady: action.payload,
			}

			refreshState(returnedState)
			return returnedState

		case SET_SESSION_PAUSED:
			returnedState = set(cloneDeep(state), "session.sessionPaused", action.payload)
			if (action.payload) {
				returnedState = set(cloneDeep(returnedState), "session.previousVideoScreenStatus", state.videoScreenStatus)
				returnedState = set(cloneDeep(returnedState), "videoScreenStatus", "Session Paused")
			} else {
				// * revert to previous screen status
				returnedState = set(cloneDeep(returnedState), "videoScreenStatus", state.session.previousVideoScreenStatus)
			}

			refreshState(returnedState)
			return returnedState

		/* case START_CONSULTATION:
			returnedState = {
				...state,
				consultationNotification: action.payload.status,
			}

			refreshState(returnedState)
			return returnedState

		case SET_CONSULTATION_NOTIFICATION:
			returnedState = {
				...state,
				consultationNotification: action.payload,
			}

			refreshState(returnedState)
			return returnedState */

		case SET_SHOW_DOCTORS_NOTES:
			returnedState = {
				...state,
				showDoctorsNotes: action.payload,
			}

			refreshState(returnedState)
			return returnedState

		case SET_CONSULTATION_HISTORY:
			returnedState = set(cloneDeep(state), "consultation.patient.history", action.payload)

			refreshState(returnedState)
			return returnedState

		case SHOW_CONSULTATION_DETAILS:
			returnedState = {
				...state,
				showConsultationDetails: action.payload.show,
				consultationDetailsId: action.payload.id,
			}

			refreshState(returnedState)
			return returnedState

		case SET_CONSULTATION:
			returnedState = {
				...state,
				consultation: action.payload,
			}

			refreshState(returnedState)
			return returnedState

		// * ----------- Messages
		case SET_MESSAGES:
			returnedState = {
				...state,
				messages: action.payload,
			}

			refreshState(returnedState)
			return returnedState

		case SET_MESSAGE_RECIPIENT:
			returnedState = {
				...state,
				message: {
					...state.message,
					recipient: action.payload,
				},
			}

			refreshState(returnedState)
			return returnedState

		case SET_MESSAGE_VIEW:
			returnedState = {
				...state,
				message: {
					...state.message,
					view: action.payload,
				},
			}

			refreshState(returnedState)
			return returnedState

		case SET_MESSAGE_MODE:
			returnedState = {
				...state,
				message: {
					...state.message,
					mode: action.payload,
				},
			}

			refreshState(returnedState)
			return returnedState

		case OPENMESSAGE:
			returnedState = {
				...state,
				message: {
					...state.message,
					body: action.payload.body,
					senderData: action.payload.senderData,
					// new: action.payload.new,
					open: true,
				},
			}

			refreshState(returnedState)
			return returnedState

		case CLOSEMESSAGE:
			returnedState = {
				...state,
				message: {
					...state.message,
					body: null,
					senderData: null,
					open: false,
				},
			}

			refreshState(returnedState)
			return returnedState

		// * ----------- End of Messages

		// * ----------- Snackbar
		case SHOW_SNACK:
			returnedState = {
				...state,
				showSnack: true,
				snackMessage: action.payload,
			}

			refreshState(returnedState)
			return returnedState

		case HIDE_SNACK:
			returnedState = {
				...state,
				showSnack: false,
			}

			refreshState(returnedState)
			return returnedState
		// * ----------- End of Snackbar

		// * ----------- Spinner
		case SHOW_SPINNER: {
			returnedState = set(cloneDeep(state), "spinner.show", true)
			returnedState = set(cloneDeep(returnedState), "spinner.text", action.payload.text || "")
			returnedState = set(cloneDeep(returnedState), "spinner.fullMode", action.payload.fullMode || false)
			returnedState = set(cloneDeep(returnedState), "spinner.lightFont", action.payload.lightFont || false)

			refreshState(returnedState)
			return returnedState
		}

		case HIDE_SPINNER: {
			returnedState = {
				...state,
				spinner,
			}
			refreshState(returnedState)
			return returnedState
		}

		// * ----------- End of Spinner

		// * ----------- Manage Doctors Screen

		case SHOW_MANAGE_DOCTOR_SCREEN: {
			returnedState = {
				...state,
				showManageDoctorsScreen: true,
			}
			refreshState(returnedState)
			return returnedState
		}

		case CLOSE_MANAGE_DOCTOR_SCREEN: {
			returnedState = {
				...state,
				showManageDoctorsScreen: false,
			}
			refreshState(returnedState)
			return returnedState
		}

		default:
			return state
	}
}

export const login = (dispatch, payload) => {
	dispatch({
		type: LOGIN,
		payload,
	})
}

export const logout = (dispatch) => {
	dispatch({
		type: LOGOUT,
	})
}

export const setGlobalSettings = (dispatch, payload) => {
	dispatch({
		type: SET_GLOBAL_SETTINGS,
		payload,
	})
}

export const setModalScreenActive = (dispatch, payload) => {
	dispatch({
		type: MODAL_SCREEN_ACTIVE,
		payload,
	})
}

export const setSockets = (dispatch, payload) => {
	dispatch({
		type: SET_SOCKETS,
		payload,
	})
}

export const setStream = (dispatch, payload) => {
	dispatch({
		type: SET_STREAM,
		payload,
	})
}

export const updateAppointmentList = (dispatch, payload) => {
	dispatch({
		type: LOAD_APPOINTMENTS,
		payload,
	})
}

export const loadPatients = (dispatch, payload) => {
	dispatch({
		type: LOAD_PATIENTS,
		payload,
	})
}

export const setSelectedMonth = (dispatch, payload) => {
	dispatch({
		type: SET_SELECTED_MONTH,
		payload,
	})
}

export const setSelectedYear = (dispatch, payload) => {
	dispatch({
		type: SET_SELECTED_YEAR,
		payload,
	})
}

export const addDialog = (dispatch, payload) => {
	const id = payload.id || uuid() // create a new id if it was not defined
	let activeDialog = cloneDeep(currentState.dialogs.activeDialog)

	const queue = [...currentState.dialogs.queue].filter((i) => (payload.removePreviousDialogs ? i.id !== id : i))
	queue.push({ ...payload, id })

	if (payload.removePreviousDialogs && activeDialog?.id === id) {
		// remove the current activeDialog
		activeDialog = null
		Swal.close()
	}

	if (!activeDialog) {
		activeDialog = queue[0]
		queue.shift()
		dispatch({
			type: SET_ACTIVE_DIALOG,
			payload: activeDialog,
		})
	}

	dispatch({
		type: UPDATE_DIALOG_QUEUE,
		payload: queue,
	})

	return id
}

export const removeDialog = (dispatch, payload) => {
	let activeDialog = cloneDeep(currentState.dialogs.activeDialog)

	// * if payload id is given, filter out the matching ids. else, with a payload = null, all the rest of the dialogs will be accepted
	const queue = currentState.dialogs.queue.filter((i) => i.id !== payload)

	if (!payload || (currentState?.dialogs?.activeDialog?.id && currentState.dialogs.activeDialog.id === payload)) {
		// id is not given or id is activeDialog. remove activeDialog
		activeDialog = queue[0]

		// this will trigger the next dialog
		dispatch({
			type: SET_ACTIVE_DIALOG,
			payload: activeDialog,
		})
		queue.shift()
	}

	dispatch({
		type: UPDATE_DIALOG_QUEUE,
		payload: queue,
	})
}

export const clearDialogs = (dispatch) => {
	Swal.close()

	dispatch({
		type: CLEAR_DIALOG_QUEUE,
	})
}

export const setSessionEndTime = (dispatch, payload) => {
	dispatch({
		type: SET_SESSION_ENDTIME,
		payload,
	})
}

export const setVideoMode = (dispatch, payload) => {
	dispatch({
		type: SET_VIDEO_MODE,
		payload,
	})
}

export const setPeerVideoStream = (dispatch, payload) => {
	dispatch({
		type: SET_PEER_VIDEO_STREAM,
		payload,
	})
}

export const setVideoScreenVisible = (dispatch, payload) => {
	dispatch({
		type: SET_VIDEO_SCREEN_VISIBLE,
		payload,
	})
}

export const setVideoScreenStatus = (dispatch, payload) => {
	dispatch({
		type: SET_VIDEO_SCREEN_STATUS,
		payload,
	})
}

export const setCallStarted = (dispatch, payload) => {
	dispatch({
		type: CALL_STARTED,
		payload,
	})
}

export const setSessionReady = (dispatch, payload) => {
	dispatch({
		type: SET_SESSION_READY,
		payload,
	})
}

export const setSessionPaused = (dispatch, payload) => {
	dispatch({
		type: SET_SESSION_PAUSED,
		payload,
	})
}

export const startConsultation = (dispatch, payload) => {
	dispatch({
		type: START_CONSULTATION,
		payload,
	})
}

export const setConsultationNotification = (dispatch, payload) => {
	dispatch({
		type: SET_CONSULTATION_NOTIFICATION,
		payload,
	})
}

export const setShowDoctorsNotes = (dispatch, payload) => {
	dispatch({
		type: SET_SHOW_DOCTORS_NOTES,
		payload,
	})
}
export const setConsultationHistory = (dispatch, payload) => {
	dispatch({
		type: SET_CONSULTATION_HISTORY,
		payload,
	})
}
export const setShowConsultationDetails = (dispatch, payload) => {
	dispatch({
		type: SHOW_CONSULTATION_DETAILS,
		payload,
	})
}

export const setConsultation = (dispatch, payload) => {
	dispatch({
		type: SET_CONSULTATION,
		payload,
	})
}

// * --------- Messages

export const setMessages = (dispatch, payload) => {
	dispatch({
		type: SET_MESSAGES,
		payload,
	})
}

export const setMessageRecipient = (dispatch, payload) => {
	dispatch({
		type: SET_MESSAGE_RECIPIENT,
		payload,
	})
}

export const setMessageView = (dispatch, payload) => {
	dispatch({
		type: SET_MESSAGE_VIEW,
		payload,
	})
}

export const setMessageMode = (dispatch, payload) => {
	dispatch({
		type: SET_MESSAGE_MODE,
		payload,
	})
}

export const openMessage = (dispatch, payload) => {
	dispatch({
		type: OPENMESSAGE,
		payload,
	})
}
export const closeMessage = (dispatch) => {
	dispatch({
		type: CLOSEMESSAGE,
	})
}

// * --------- End of Messages

// * --------- Snackbar
export const showSnack = (dispatch, payload) => {
	dispatch({
		type: SHOW_SNACK,
		payload,
	})
}

export const hideSnack = (dispatch) => {
	dispatch({
		type: HIDE_SNACK,
	})
}
// * --------- End of Snackbar

// * --------- Spinner
export const showSpinner = (dispatch, payload) => {
	dispatch({
		type: SHOW_SPINNER,
		payload,
	})
}

export const hideSpinner = (dispatch) => {
	dispatch({
		type: HIDE_SPINNER,
	})
}
// * --------- End of Spinner

// * --------- Manage Doctors Screen
export const showManageDoctorsScreen = (dispatch) => {
	dispatch({
		type: SHOW_MANAGE_DOCTOR_SCREEN,
	})
}

export const closeManageDoctorsScreen = (dispatch) => {
	dispatch({
		type: CLOSE_MANAGE_DOCTOR_SCREEN,
	})
}
