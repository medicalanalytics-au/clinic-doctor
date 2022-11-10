/**
 * Dashboard -> Appointments -> AppointmentDetails
 * Details dialog screen. Executed when appointment <Row/> is clicked outside ActionButton
 */

import { useContext, useEffect, useRef, useState } from "react"
import "../../App.css"
import PropTypes from "prop-types"
import { DateTime } from "luxon"

// material ui
import { Button } from "@mui/material"

// Sweetalert2
import { addDialog, setShowConsultationDetails } from "../../utils/context"
import { GenericDialog } from "../../utils/sweetalertDialogs"

// Context
import { ProfileContext } from "../../App"

// constants
import { APPOINTMENT_TYPE, center, MAINCOLOR, MAINCOLOR_LIGHT, REQUESTSTATUS, SESSION, WHITE } from "../../utils/constants"

// network
import { doctor_cancelAppointment, doctor_getPatientsDetails } from "../../utils/network"

// custom functions
import { formatDate, getStringifiedDuration, loadAppointments, mobilePortrait, now, showError, useResponsiveMedia } from "../../utils/helpers"

const { DATE_SHORT, TIME_SIMPLE } = DateTime

const AppointmentDetails = (props) => {
	const [record, setRecord] = useState()
	const [patientName, setPatientName] = useState("Loading...")
	// const patientName = useRef("Loading...")

	const value = useContext(ProfileContext)
	const { dispatch, state } = value
	const appointmentRef = useRef(state.appointments)

	// const getRecord = useCallback((_id) => appointments[appointments.findIndex((i) => i._id === _id)], [appointments])

	const media = useResponsiveMedia()
	const isMobilePortrait = mobilePortrait(media)

	const styles = {
		...subStyles,
		infoContainer: {
			...supportStyles.infoContainer,
			flexDirection: isMobilePortrait ? "column" : "row",
		},
		infoBox: {
			...supportStyles.infoBox,
			width: isMobilePortrait ? "100%" : "50%",
		},
		timeBox: {
			
			...supportStyles.timeBox,
			width: isMobilePortrait ? "100%" : "50%",
		},
		info: {
			...supportStyles.info,
			appointmentType: {
				...supportStyles.info.appointmentType,
			},
		},
		nameBox: {
			...supportStyles.nameBox,
			marginRight: isMobilePortrait ? "0px" : "10px",
		},
	}

	useEffect(() => {
		if (props.appointment_id) {
			if (appointmentRef.current) console.log("appointmentRef.current", appointmentRef.current)
			const pos = appointmentRef.current.findIndex((i) => i._id === props.appointment_id)
			if (pos > -1) {
				const _record = appointmentRef.current[pos]
				if (_record.patient) {
					doctor_getPatientsDetails(dispatch, _record.patient.patient_id)
						.then((res) => {
							if (res.profile.name) setPatientName(res.profile.name)
						})
						.catch((error) => showError(dispatch, error))
				}
				setRecord(_record)
			}
		}
	}, [props.appointment_id, dispatch])

	/* useEffect(() => {
		const fetchData = async () => {
			const res = await doctor_getPatientsDetails(dispatch, record.patient.patient_id)
			res.profile.name && setPatientName(res.profile.name)
		}
		record?.patient?.patient_id && fetchData()
	}, [record, dispatch]) */

	const cancelAppointment = () => {
		addDialog(dispatch, {
			dialog: GenericDialog("Cancel Appointment?"),
			onConfirm: () => {
				const { _id, doctor_id } = record
				doctor_cancelAppointment(dispatch, _id)
					.then(() => {
						loadAppointments(doctor_id, state.selectedMonth, state.selectedYear, dispatch)
						props.close()
					})
					.catch((error) => showError(dispatch, error))
			},
		})
	}

	const missedAppointment = record?.patient?.status === REQUESTSTATUS.MISSED
	const onlineAppointment = record?.appointmentType === APPOINTMENT_TYPE.ONLINE
	const validOnlineAppointment = onlineAppointment && record?.endTime > now()

	const getButtonLabel = () => (missedAppointment ? "Assign Appointment" : validOnlineAppointment ? "Cancel appointment" : "Close")

	const handleClick = () => (missedAppointment ? props.onAssign() : validOnlineAppointment ? cancelAppointment() : props.close())

	return (
		<div style={styles.body}>
			{record?.patient?.patient_id && record?.patient?.status !== REQUESTSTATUS.MISSED && (
				<div style={styles.nameBox}>
					{patientName}
					<Button
						style={{ color: WHITE }}
						onClick={() => setShowConsultationDetails(dispatch, { show: true, id: record.patient.patient_appointment_id })}
					>
						{isMobilePortrait ? "View" : "View Consultation"}
					</Button>
				</div>
			)}
			<div style={styles.infoContainer}>
				<div style={styles.infoBox}>
					<div style={styles.info.appointmentStatus}>
						<div style={styles.info.appointmentType}>
							{record?.appointmentType === "online" ? "ONLINE CLINIC" : record?.appointmentType.toUpperCase()}
						</div>
						{record?.patient?.status === REQUESTSTATUS.PENDING_PAYMENT && <div style={styles.pendingPaymentStatus}>PENDING PAYMENT</div>}
						{missedAppointment && <div style={styles.pendingPaymentStatus}>MISSED REQUEST</div>}
						{record?.startTime < now() && record?.endTime > now() && <div style={styles.sessionStatus}>In Session</div>}
						{record?.status === SESSION.COMPLETED && <div style={styles.sessionStatus}>Completed</div>}
					</div>
					<div style={styles.detailsLine}>
						<div style={styles.detailsTitle}>Date:</div>
						<div>{formatDate(record?.startTime || 0, DATE_SHORT)}</div>
					</div>

					<div style={styles.detailsLine}>
						<div style={styles.detailsTitle}>Booked On:</div> <div>{formatDate(record?.bookingDate || 0)}</div>
					</div>
				</div>
				{(!record?.patient || !missedAppointment) && (
					<div style={styles.timeBox}>
						<div style={styles.detailsLine}>
							<div style={styles.detailsTitle}>Start Time:</div>
							<div>{formatDate(record?.startTime || 0, TIME_SIMPLE)}</div>
						</div>

						<div style={styles.detailsLine}>
							<div style={styles.detailsTitle}>End Time:</div>
							<div>{formatDate(record?.endTime || 0, TIME_SIMPLE)}</div>
						</div>

						<div style={styles.detailsLine}>
							<div style={styles.detailsTitle}>Duration</div>
							<div>{getStringifiedDuration(record?.startTime, record?.endTime)}</div>
						</div>
					</div>
				)}
			</div>

			<Button variant="contained" style={{ minWidth: "100px", marginBottom: "50px" }} onClick={handleClick}>
				{getButtonLabel()}
			</Button>
		</div>
	)
}
AppointmentDetails.propTypes = {
	appointment_id: PropTypes.string,
	open: PropTypes.bool,
	close: PropTypes.func,
	onAssign: PropTypes.func,
}

const subStyles = {
	overlay: {
		height: "100%",
		width: "100%",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
	body: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		height: "100%",
		position: "relative",
		justifyContent: "space-between",
	},
	detailsLine: {
		color: "black",
		display: "flex",
		flexDirection: "row",
		marginBottom: "10px",
	},
	detailsTitle: {
		fontWeight: "bold",
		marginRight: "10px",
		width: "150px",
	},
	statusButtonContainer: {
		color: "black",
		display: "flex",
		justifyContent: "center",
		marginBottom: "40px",
	},
	notesContainer: {
		height: "40%",
		width: "90%",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		border: "1px solid silver",
		padding: "10px",
		borderRadius: "5px",
		justifyContent: "space-between",
	},
	notesBody: {
		display: "flex",
		flexDirection: "column",
		width: "100%",
	},
	notesToolbar: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: "10px",
	},
	pendingPaymentStatus: {
		fontWeight: "bold",
		color: "red", 
	},
	sessionStatus: {
		fontWeight: "bold",
		color: MAINCOLOR, 
		justifyContent: "flex-end",
		alignItems: "flex-end",
	},
}

const supportStyles = {
	infoContainer: {
		display: "flex",
		width: "80%",
		...center, 
	},
	infoBox: {
		display: "flex",
		flexDirection: "column", 
	},
	info: {
		appointmentStatus: {
			display: "flex",
			flexDirection: "row",
			marginBottom: "10px",
			alignItems: "flex-end",
		},
		appointmentType: {
			color: MAINCOLOR,
			fontWeight: "bold",
			letterSpacing: "0.1em",
			...subStyles.detailsTitle,
		},
	},
	timeBox: {
		border: "1px solid " + MAINCOLOR,
		borderRadius: "5px",
		padding: "10px",
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
	},
	nameBox: {
		marginBottom: "5px",
		width: "97%",
		padding: "10px",
		backgroundColor: MAINCOLOR_LIGHT,
		color: WHITE,
		fontWeight: "bold",
		justifyContent: "space-between",
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		margin: "10px",
	},
}
export default AppointmentDetails
