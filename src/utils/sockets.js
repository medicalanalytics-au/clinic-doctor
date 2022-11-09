import { DateTime } from "luxon"

import {
	addDialog,
	removeDialog,
	setSelectedMonth,
	VIEW_ALL_ACTIVE,
	showSnack,
	setSessionReady,
	setShowDoctorsNotes,
	clearDialogs,
	setVideoScreenStatus,
	setConsultation,
	setVideoMode,
	setSockets,
} from "./context"

// Sweetalert2
import Swal from "sweetalert2"
import { AppointmentRequestCountdown, GenericAlert, GenericDialog, GenericError, ConsultationSummaryDialog } from "./sweetalertDialogs"

import { doctor_changeAppointmentStatus, doctor_loadConsultation, doctor_startAppointmentNow } from "./network"

import { calculateAge, loadAppointments, now, showError } from "./helpers"

export const loadActiveAppointments = (dispatch, id) => {
	setSelectedMonth(dispatch, VIEW_ALL_ACTIVE)
	loadAppointments(id, VIEW_ALL_ACTIVE, "", dispatch)
}

export const socketFunctions = (socket, id, dispatch, state) => {
	socket.onAny((event, ...args) => {
		setSockets(dispatch, socket)
		console.log({ event, args })
	})

	socket.on("identify", (serverSocketId) => {
		// ! currently serverSocketId args is unused
		socket.emit("identify", { client: "doctor", id })
		// response()
	})

	// * Appointment functions
	socket.on("appointment_request", (args) => {
		const { datetime, appointment_id, doctor_id } = args

		const data = {
			appointment_id,
			doctor_id,
		}

		addDialog(dispatch, {
			dialog: AppointmentRequestCountdown(Swal, datetime, id, dispatch),
			onConfirm: () => socket.emit("doctor_appointment_request_accepted", data),
			onDeny: () => socket.emit("doctor_appointment_request_rejected", data),
			onDismiss: () => socket.emit("doctor_appointment_request_timeout", data),
		})
	})

	socket.on("consultation_appointment_created", () => loadActiveAppointments(dispatch, id))

	socket.on("appointment_confirmed", (doctor_appointment_id) => {
		doctor_loadConsultation(dispatch, doctor_appointment_id)
			.then((res) => {
				setConsultation(dispatch, res)
				loadActiveAppointments(dispatch, id)

				const { doctor_appointment_id, patient_appointment_id, patient, summary } = res
				const { dob, sex } = patient
				const { text, image } = summary

				const age = calculateAge(dob)
				const _sex = sex === "m" ? "Male" : "Female"

				addDialog(dispatch, {
					dialog: ConsultationSummaryDialog(age, _sex, text, image),
					onConfirm: () => doctor_startAppointmentNow(dispatch, doctor_appointment_id, now(), patient_appointment_id),
				})
			})
			.catch((error) =>
				addDialog(dispatch, {
					dialog: GenericError(error),
				})
			)
	})

	socket.on("appointment_request_cancelled", async () => {
		removeDialog(dispatch)
		loadActiveAppointments(dispatch, id)
		addDialog(dispatch, {
			dialog: GenericAlert("Consultation request had been cancelled"),
		})
	})

	socket.on("appointment_cancelled", async (...args) => {
		loadActiveAppointments(dispatch, id)
		let msg =
			"Consultation on <p>" +
			DateTime.fromMillis(args[0]).toLocaleString(DateTime.DATETIME_SHORT) +
			"<p>had been cancelled" +
			(args[1] > 0 ? "<p>A non-refundable payment will be deposited to your account" : "")

		addDialog(dispatch, {
			dialog: GenericAlert(msg),
		})
	})

	socket.on("payment_timeout", (args) => {
		addDialog(dispatch, {
			dialog: GenericAlert("Appointment had been cancelled due to payment timeout"),
		})
		loadActiveAppointments(dispatch, id)
	})

	// TODO check on how to validate which dialog is active before calling Swal.close()

	socket.on("start_consultation", async (args) => {
		const { appointment_id, doctor_id } = args

		doctor_loadConsultation(dispatch, appointment_id)
			.then((res) => {
				console.log({ res })
				setConsultation(dispatch, res)
			})
			.catch((error) => showError(dispatch, error))

		// * this will trigger useEffect in VideoScreen that will prompt with a dialog
		// * appointmentId will update context currentAppointment

		socket.emit("doctor_ready", { appointment_id, doctor_id, id: 4 })
		setVideoScreenStatus(dispatch, "Waiting for patient")
		setSessionReady(dispatch, true)
	})

	socket.on("notification", async (args) => {
		if (args.notificationType === "doctors_appointment") {
			// * --------------------------------------------------------------- "online" ---------------------------------------------------------------
			// * ----------------------------------------------------------------------------------------------------------------------------------------
			if (args.appointmentType === "online") {
				if (args.signal === "start") {
					addDialog(dispatch, {
						id: args.appointment_id,
						removePreviousDialogs: true,
						dialog: GenericDialog("You have an online clinic", "Start session?"),
						onConfirm: () => {
							// * start session
							setSelectedMonth(dispatch, VIEW_ALL_ACTIVE)
							doctor_changeAppointmentStatus(dispatch, args.appointment_id, "started")
								.then(() => loadAppointments(id, VIEW_ALL_ACTIVE, "", dispatch))
								.catch((error) => {
									addDialog(dispatch, {
										dialog: GenericError(error),
									})
								})
						},
						onDeny: () => loadActiveAppointments(dispatch, id),
						onDismiss: () => loadActiveAppointments(dispatch, id),
					})
				} else if (args.signal === "end") {
					// TODO --- CHECK FOR UPDATE ON SERVER TO SEE WHETHER WAS THE STATUS UPDATED TO REFLECT "end",
					// TODO --- ELSE, UPDATE THROUGH doctor_changeAppointmentStatus()

					loadActiveAppointments(dispatch, id)
					addDialog(dispatch, { id: args.appointment_id, removePreviousDialogs: true, dialog: GenericAlert("Online clinic ended") })
				}
			} else {
				// * ------------------------------------------------------------ "consultation" ------------------------------------------------------------
				// * ----------------------------------------------------------------------------------------------------------------------------------------
				if (args.signal === "start") {
					// * this event is only triggered on resuming consultation after disconnection

					const { appointment_id } = args
					doctor_loadConsultation(dispatch, args.appointment_id)
						.then((res) => {
							const { doctor_id } = res
							setConsultation(dispatch, res)
							addDialog(dispatch, {
								id: appointment_id,
								removePreviousDialogs: true,
								dialog: GenericDialog("You have a consultation clinic", "Start Session?"),
								onConfirm: () => {
									socket.emit("doctor_ready", { appointment_id, doctor_id, id: 2 })
									setVideoScreenStatus(dispatch, "Waiting for patient")
									setSessionReady(dispatch, true)
								},
								onDeny: () => loadActiveAppointments(dispatch, doctor_id),
								onDismiss: () => loadActiveAppointments(dispatch, doctor_id),
							})
						})
						.catch((error) => showError(dispatch, error))

					// * this will trigger useEffect in VideoScreen that will prompt with a dialog
					// startConsultation(dispatch, { status: true })
				} else {
					// * end
					clearDialogs(dispatch)

					addDialog(dispatch, {
						id: args.appointment_id,
						removePreviousDialogs: true,
						dialog: GenericAlert("Session ended", "Consultation"),
						onConfirm: () => loadActiveAppointments(dispatch, id),
					})

					// startConsultation(dispatch, { status: false })
					setSessionReady(dispatch, false)

					try {
						// * refresh consultation data
						doctor_loadConsultation(dispatch, args.appointment_id)
							.then((res) => setConsultation(dispatch, res))
							.catch((error) => showError(dispatch, error))
						setShowDoctorsNotes(dispatch, true)
					} catch (error) {
						showError(dispatch, error)
					}
				}
			}
		}

		// * notification will be removed from server
		socket.emit("doctor_notification_received", { notification_id: args.notification_id })
	})

	socket.on("mail", (mail) => {
		/* common_downloadMessages(dispatch, mail.to_id)
			.then((res) => {
				setMessages(dispatch, res)
				showSnack(dispatch, "You have mail")
			})
			.catch((error) => showError(dispatch, error)) */
	})

	socket.on("online_clinic_timing_modified", () => {
		showSnack(dispatch, "Upcoming clinic session timing had been modified")
	})

	socket.on("request_expired", () => {
		// TODO
		console.log("request expired already lah")
	})

	socket.on("missed_appointment", (id) => {
		loadActiveAppointments(dispatch, id)
		addDialog(dispatch, {
			dialog: GenericAlert("There is an unanswered appointment request"),
		})
	})

	socket.on("missed_appointment_assigned", (id) => {
		loadActiveAppointments(dispatch, id)
		addDialog(dispatch, {
			dialog: GenericAlert("You had been assigned to an unanswered request"),
		})
	})

	socket.on("video_mode_declined", () => {
		showSnack(dispatch, "Video request rejected")
	})

	socket.on("video_mode_error", () => {
		showSnack(dispatch, "Error in establishing video")
	})

	socket.on("video_mode_switch", () => {
		setVideoMode(dispatch, true)
	})
}
