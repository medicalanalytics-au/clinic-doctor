import { useContext, useEffect, useState, useCallback, useRef } from "react"
import "../App.css"
import PropTypes from "prop-types"

// material ui
import { BottomNavigation, BottomNavigationAction } from "@mui/material"

// react icons
import { MdVideoCameraFront } from "react-icons/md"
import { RiUserSearchLine } from "react-icons/ri"
import { GoDashboard } from "react-icons/go"

// images
import clock from "../images/clock.png"

// Simple Peer
import Peer from "simple-peer"

// context
import { ProfileContext } from "../App"
import {
	setShowDoctorsNotes,
	setSessionReady,
	setShowConsultationDetails,
	setVideoScreenStatus,
	setVideoScreenVisible,
	setPeerVideoStream,
} from "../utils/context"

// Swal
import Swal from "sweetalert2"
import { removeDialog, addDialog } from "../utils/context"
import { GenericDialog, GenericError, GenericAlert } from "../utils/sweetalertDialogs"

// custom functions
import { getDuration, loadAppointments, now, showError } from "../utils/helpers"
import { modifySessionStatus } from "./Appointments/Appointments"

// constants
import { APPOINTMENT_TYPE, MIN_20, MIN_5, SESSION } from "../utils/constants"

// custom components
import Dashboard from "./Dashboard/Dashboard"
import DashboardModal from "./Dashboard/DashboardModal"
import ConsultationSummary from "./Consultation/ConsultationSummary/ConsultationSummary"
import Patients from "./Patients/Patients"
import VideoScreen from "./Consultation/VideoScreen/VideoScreen"
import ConsultationDetails from "./Common/ConsultationDetails"
import ModalScreen from "./Common/ModalScreen"
import ConsultationDuration from "./ConsultationDuration"

// network
import { doctor_setOnlineAppointment, doctor_startAppointmentNow } from "../utils/network"

const STUN_URL = process.env.REACT_APP_STUN_URL
const TURN_URL = process.env.REACT_APP_TURN_URL
const TURN_USERNAME = process.env.REACT_APP_TURN_USERNAME
const TURN_CREDENTIAL = process.env.REACT_APP_TURN_CREDENTIAL

const Main = (props) => {
	const { state, dispatch } = useContext(ProfileContext)

	const {
		dialogs,
		appointments,
		socket,
		_id,
		showDoctorsNotes,
		sessionReady,
		showConsultationDetails,
		consultationDetailsId,
		stream,
		videoScreenVisible,
		consultation,
	} = state

	const { doctor_appointment_id } = consultation
	const { activeDialog } = dialogs

	const [selectEndTimeOpen, setSelectEndTimeOpen] = useState(false)
	const [activeAppointments, setActiveAppointments] = useState([])

	const [page, setPage] = useState(0)
	const pages = [<Dashboard close={() => props.close()} />, <Patients />]

	const peerId = useRef()
	const _peer = useRef()
	const _stream = useRef()

	const closeConsultationDetails = () => setShowConsultationDetails(dispatch, { show: false, id: "" }) // id = appointment id

	// ! ************************************************************ Initialization ************************************************************ //
	// * download messages on load of Main page

	/* useEffect(() => {
		downloadMessages(dispatch, state._id)
	}, [state._id, dispatch, socket]) */
	// ! **************************************************************************************************************************************** //

	useEffect(() => {
		setActiveAppointments(appointments.filter((i) => i.endTime >= now()))
	}, [appointments])

	// ! *********************************************************** Dialog Handler ************************************************************* //
	useEffect(() => {
		if (activeDialog) {
			removeDialog(dispatch) // prevent double trigger of dialog

			Swal.fire(activeDialog.dialog)
				.then((result) => {
					if (result.isConfirmed && activeDialog.onConfirm) activeDialog.onConfirm(result.value)
					if (result.isDenied && activeDialog.onDeny) activeDialog.onDeny()
					if (result.isDismissed && activeDialog.onDismiss) activeDialog.onDismiss()
				})
				.catch((error) => {
					Swal.fire(GenericError(error))
				})
		}
	}, [activeDialog, dispatch])

	// ! **************************************************************************************************************************************** //

	// ! *********************************************************** Video Handler ************************************************************** //

	const destroyPeer = useCallback(
		(screenStatus) => {
			if (_peer.current) {
				_peer.current.destroy()
				_peer.current = null
			}
			// screenStatus && setVideoScreenStatus(dispatch, screenStatus)
			videoScreenVisible && setVideoScreenVisible(dispatch, false)
		},
		[dispatch, videoScreenVisible]
	)

	/* useEffect(() => {
		if (sessionPaused && _peer.current) {
			socket.emit("session_paused", doctor_appointment_id)
			 destroyPeer("Session paused")

			modifySessionStatus(SESSION.PAUSED, doctor_appointment_id, state, dispatch)
			loadActiveAppointments(dispatch, _id)

			setSessionReady(dispatch, false) 
		}
	}, [sessionPaused, doctor_appointment_id, state, dispatch, _id, destroyPeer, socket]) */

	const setPatientOnline = useCallback(() => {
		setVideoScreenStatus(dispatch, "Patient is online. Establishing connection")
	}, [dispatch])

	useEffect(() => {
		const handler = () => {
			socket.emit("doctor_ready", { appointment_id: doctor_appointment_id, doctor_id: _id, id: 1 })
			setPatientOnline()
		}
		sessionReady && socket.on("patient_ready", handler)
		return () => socket && socket.off("patient_ready", handler)
	}, [socket, _id, doctor_appointment_id, setPatientOnline, sessionReady])

	const createPeer = useCallback(
		(data) => {
			if (!_peer.current) {
				_peer.current = new Peer({
					initiator: false,
					trickle: false,
					stream: _stream.current,
					config: {
						iceServers: [
							{
								urls: STUN_URL,
							},
							{
								urls: TURN_URL,
								username: TURN_USERNAME,
								credential: TURN_CREDENTIAL,
							},
						],
					},
				})

				_peer.current && _peer.current.signal(data)

				_peer.current.on("signal", (data) => {
					socket.emit("doctor_signal", { patient_id: peerId.current, data })
				})

				_peer.current.on("stream", (videoStream) => {
					setVideoScreenStatus(dispatch, "Connected")
					setVideoScreenVisible(dispatch, true)
					setPeerVideoStream(dispatch, videoStream)
				})

				_peer.current.on("error", (error) => destroyPeer(error))
				_peer.current.on("close", () => destroyPeer(null))
			}
		},
		[destroyPeer, dispatch, socket]
	)

	useEffect(() => {
		socket.on("patient_initiate_call", (patient_id) => {
			socket.emit("doctor_call_accept", { doctor_id: _id, patient_id })
		})
	}, [_id, socket])

	useEffect(() => {
		if (stream) _stream.current = stream
	})

	useEffect(() => {
		socket.on("signal", (args) => {
			const { data, patient_id } = args
			peerId.current = patient_id
			_stream.current && createPeer(data)
		})
	}, [socket, createPeer, stream, state])

	useEffect(() => {
		const handler = () => {
			const PAUSE_MSG = "Session paused by patient"
			setVideoScreenStatus(dispatch, PAUSE_MSG)
			addDialog(dispatch, {
				dialog: GenericAlert(PAUSE_MSG),
			})
			destroyPeer(PAUSE_MSG)
		}
		socket.on("patient_pause_consultation", handler)
		return () => socket.off("patient_pause_consultation", handler)
	}, [socket, destroyPeer, dispatch])

	useEffect(() => {
		const handler = () => {
			destroyPeer("Disconnected")
			setVideoScreenStatus(dispatch, "Patient disconnected")
		}

		socket.on("peer_disconnected", handler)
		return () => socket.off("peer_disconnected", handler)
	}, [socket, destroyPeer, dispatch])

	// ! **************************************************************************************************************************************** //

	// ! ********************************************************* Navigation Selection ********************************************************* //
	const startClinic = (endTime) => {
		const startNow = () => {
			const appt = {
				doctor_id: state._id,
				startTime: now(),
				endTime,
				notes: "",
				appointmentType: "online",
			}

			doctor_setOnlineAppointment(dispatch, appt)
				.then(() => loadAppointments(state._id, state.selectedMonth, state.selectedYear, dispatch))
				.catch((error) => {
					addDialog(dispatch, {
						dialog: GenericError(error),
					})
				})
		}

		if (activeAppointments.length === 0) startNow()
		else {
			if (endTime > activeAppointments[0].startTime - MIN_5) {
				addDialog(dispatch, {
					dialog: GenericDialog("You have a clinic that coincides with this session", "Combine sessions?"),
					onConfirm: () => {
						// * combine sessions
						doctor_startAppointmentNow(dispatch, activeAppointments[0]._id, now()) // param now() is included to synchronise start time with server
							.then(() => loadAppointments(state._id, state.selectedMonth, state.selectedYear, dispatch))
							.catch((error) => showError(dispatch, error))
					},
				})
			} else startNow()
		}
	}

	const reviewSessions = () => {
		const _now = now()

		if (activeAppointments.length > 0) {
			const appt = activeAppointments[0]
			if (appt.startTime <= _now) {
				// started
				if (appt.endTime >= _now) {
					const msg = appt.appointmentType === APPOINTMENT_TYPE.ONLINE ? "Resume clinic?" : "Resume consultation?"
					addDialog(dispatch, {
						dialog: GenericDialog(msg, "You are currently in session"),
						onConfirm: () => {
							appt.appointmentType === APPOINTMENT_TYPE.CONSULTATION && setSessionReady(dispatch, true)
							modifySessionStatus(SESSION.RESUME, appt._id, state, dispatch)
						},
					})
				} else console.log("past", activeAppointments)
			} else {
				// future
				if (appt.appointmentType === APPOINTMENT_TYPE.ONLINE) {
					const value = appt.startTime - now()
					if (value < MIN_20) {
						// * there is a 15 mins slot + 5 mins buffer available
						const { minutes } = getDuration(value)

						addDialog(dispatch, {
							dialog: GenericDialog("You have a clinic starting in " + Math.round(minutes) + " minutes", "Combine sessions?"),
							onConfirm: () => {
								// * combine sessions
								doctor_startAppointmentNow(dispatch, appt._id, now()) // param now() is included to synchronise start time with server
									.then(() => loadAppointments(state._id, state.selectedMonth, state.selectedYear, dispatch))
									.catch((error) => showError(dispatch, error))
							},
						})
					} else {
						// * open end time selection box
						setSelectEndTimeOpen(true)
					}
				} else {
					// * APPOINTMENT_TYPE.CONSULTATION

					if (appt.startTime - now() > MIN_20) {
						setSelectEndTimeOpen(true)
					} else {
						const { minutes } = getDuration(appt.startTime - now())

						addDialog(dispatch, {
							dialog: GenericError("You have a clinic starting in " + Math.round(minutes) + " minutes"),
						})
					}
				}
			}
		} else {
			setSelectEndTimeOpen(true) // * open end time selection box
		}
	}
	// ! **************************************************************************************************************************************** //

	return (
		<div style={styles.mainContainer}>
			<ModalScreen
				icon={clock}
				open={selectEndTimeOpen}
				close={() => setSelectEndTimeOpen(false)}
				closeIcon={true}
				content={<ConsultationDuration close={() => setSelectEndTimeOpen(false)} onStartClinic={startClinic} />}
				title={"Select end time"}
			/>

			<DashboardModal
				open={showDoctorsNotes}
				close={() => setShowDoctorsNotes(dispatch, false)}
				title={"Consultation Summary"}
				content={<ConsultationSummary close={() => setShowDoctorsNotes(dispatch, false)} />}
			/>

			<DashboardModal
				open={showConsultationDetails}
				close={closeConsultationDetails}
				title={"Consultation Details"}
				content={<ConsultationDetails id={consultationDetailsId} close={closeConsultationDetails} />}
			/>

			<VideoScreen open={sessionReady} close={() => setSessionReady(dispatch, false)} />

			<div style={styles.body}>
				<div>{pages[page === 2 ? 1 : page]}</div> {/* change page to 1 as pages array contains only 2 items */}
				<div className="bottomNavigator">
					<BottomNavigation
						showLabels
						page={page}
						onChange={(event, newValue) => {
							newValue === 1
								? addDialog(dispatch, {
										dialog: GenericDialog("Start clinic?"),
										onConfirm: () => reviewSessions(),
								  })
								: setPage(newValue)
						}}
						style={{ width: "100%" }}
					>
						<BottomNavigationAction label="Appointments" icon={<GoDashboard />} />
						<BottomNavigationAction label="Start Clinic" icon={<MdVideoCameraFront />} />
						<BottomNavigationAction label="Patients" icon={<RiUserSearchLine />} />
					</BottomNavigation>
				</div>
			</div>
		</div>
	)
}

Main.propTypes = {
	close: PropTypes.func,
}

const styles = {
	mainContainer: {
		height: "100vh",
		width: "100vw",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		position: "relative", //
	},
	body: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
		alignItems: "center",
		height: "100%",
		width: "100%",
		position: "relative",
	},
}
export default Main
