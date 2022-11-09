import { DateTime } from "luxon"
import { removeDialog } from "./context"
import { formatStrToHTML } from "./helpers"

const MAINCOLOR = "#0a6e8a"

export const basicStyle = {
	customClass: {
		container: "sweetalert",
		input: "sweetalertInput",
	},
	confirmButtonColor: MAINCOLOR,
	denyButtonColor: "silver",
	allowOutsideClick: false,
}

export const GenericError = (msg) => ({
	...basicStyle,
	html: msg,
	showDenyButton: false,
	showCancelButton: false,
	confirmButtonText: "OK",
})

export const GenericDialog = (msg, title) => ({
	...basicStyle,
	title: title ? title : "Confirm",
	html: msg,
	showDenyButton: true,
	showCancelButton: false,
	confirmButtonText: "Yes",
	denyButtonText: "No",
})

export const SelectionDialog = (msg, title, button1, button2) => ({
	...basicStyle,
	title: title ? title : "Confirm",
	html: msg,
	showDenyButton: true,
	showCancelButton: true,
	confirmButtonText: button1,
	denyButtonText: button2,
})

export const GenericAlert = (msg, title) => ({
	...basicStyle,
	title: title ? title : "",
	html: msg,
})

export const TimePicker = (msg, title, options) => {
	return {
		...basicStyle,
		title: title ? title : "",
		input: "select",
		inputOptions: options,
		inputPlaceholder: "Select appointment time",
		html: msg,
		showDenyButton: true,
		showCancelButton: false,
		confirmButtonText: "Yes",
		denyButtonText: "No",
	}
}

export const ConsultationSummaryDialog = (age, sex, summary, image) => {
	const sexStr = sex || ""
	const ageStr = age ? (sex ? ", " + age : age + " years") : ""

	const title = age || sex ? sexStr + ageStr : "Summary"

	return {
		...basicStyle,
		title,
		imageUrl: image,
		html: summary.length > 0 ? formatStrToHTML(summary) : "No symptoms description provided",
		showDenyButton: false,
		showCancelButton: false,
		confirmButtonText: "Start consultation",
		denyButtonText: "No",
	}
}

export const AppointmentRequestCountdown = (Swal, datetime, id, dispatch) => {
	let timerInterval
	return {
		...basicStyle,
		title: "Appointment Request",
		html: DateTime.fromMillis(datetime).toLocaleString(DateTime.DATETIME_SHORT) + "<p><time></time><p>Do you accept?",
		showDenyButton: true,
		showCancelButton: false,
		confirmButtonText: "Yes",
		denyButtonText: "No",
		timer: 60000,
		didOpen: () => {
			const content = Swal.getHtmlContainer()

			timerInterval = setInterval(() => {
				content.querySelector("time").textContent = (Swal.getTimerLeft() / 1000).toFixed(0)
			}, 100)
		},
		willClose: () => {
			removeDialog(dispatch, id)
			clearInterval(timerInterval)
		},
	}
}

// ------------------------------------------------------------ end of Appointments ---------------------------------------------------- //

export const callReceived = {
	customClass: {
		container: "sweetalert",
	},
	html: "Connection request received. Answer?",
	showDenyButton: true,
	showCancelButton: false,
	confirmButtonText: "Yes",
	denyButtonText: "No",
}

export const timerWarningDialog = {
	customClass: {
		container: "sweetalert",
	},
	html: "Session ending in 03 minutes",
	position: "bottom",
	showDenyButton: true,
	showCancelButton: false,
	confirmButtonText: "OK",
	denyButtonText: `Extend`,
}

// ------------------------------------------------------------------- <Simple Peer/> ------------------------------------------------------- //

export const peerReset = {
	customClass: {
		container: "sweetalert",
	},
	title: "Error",
	html: "Connection reset by peer",
	showConfirmButton: true,
	showDenyButton: false,
	showCancelButton: false,
}

export const callEnded = {
	customClass: {
		container: "sweetalert",
	},
	title: "Info",
	html: "Call Ended",
	showConfirmButton: true,
	showDenyButton: false,
	showCancelButton: false,
}

// --------------------------------------------------------------- end of <Simple Peer/> ----------------------------------------------------- //
