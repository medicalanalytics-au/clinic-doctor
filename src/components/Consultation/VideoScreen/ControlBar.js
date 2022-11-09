import "../../../App.css"
import { useContext, useEffect, useState } from "react"
import PropTypes from "prop-types"

// material ui
import { Grow } from "@mui/material"

// react icons
import { FiPhoneOff, FiMic, FiMicOff, FiVideo, FiVideoOff, FiPower, FiPause /* FiMessageSquare */ } from "react-icons/fi"

// context
import { ProfileContext } from "../../../App"
import { setSessionPaused, setVideoMode } from "../../../utils/context"

// Swal
import { addDialog } from "../../../utils/context"
import { GenericDialog, SelectionDialog } from "../../../utils/sweetalertDialogs"

// custom functions
import { loadActiveAppointments } from "../../../utils/sockets"
import { doctor_modifySessionEndTime, doctor_switchToAudioMode } from "../../../utils/network"

// snackbox
import { showSnack } from "../../../utils/context"

// custom function
import { now, showError } from "../../../utils/helpers"
import { DARKGRAY } from "../../../utils/constants"

const ControlBar = (props) => {
	const { state, dispatch } = useContext(ProfileContext)
	const { _id, socket, consultation, session } = state
	const { sessionPaused } = session

	const { doctor_appointment_id } = consultation

	const [showPowerOptions, setShowPowerOptions] = useState(false)

	const { localAudioAvailable, videoAvailable, modifyAudioAvailability } = props

	// const _socket = useRef()

	useEffect(() => {
		setShowPowerOptions(false)
	}, [props.show])

	/* useEffect(() => {
		if (socket.connected) {
			_socket.current = socket
		}
	}, [socket]) */

	return (
		<Grow in={props.show}>
			<div style={styles.mainContainer}>
				<div style={styles.controlButtonsContainer}>
					{showPowerOptions && (
						<div style={{ marginBottom: "10px", ...center, flexDirection: "row" }}>
							<div
								style={styles.powerButtons}
								onClick={() => {
									addDialog(dispatch, {
										dialog: GenericDialog(sessionPaused ? "Resume session?" : "Pause this session?"),
										onConfirm: () => setSessionPaused(dispatch, !sessionPaused),
										onDeny: () => loadActiveAppointments(dispatch, _id),
										onDismiss: () => loadActiveAppointments(dispatch, _id),
									})
									setShowPowerOptions(false)
								}}
							>
								<FiPause size={20} color={"white"} />
							</div>
							<div
								style={styles.powerButtons}
								onClick={() => {
									setShowPowerOptions(false)
									addDialog(dispatch, {
										dialog: GenericDialog("This will end the consultation", "Alert!"),
										onConfirm: () => {
											props.close()

											doctor_modifySessionEndTime(dispatch, doctor_appointment_id, now(), "Ending session", true)
												.then(() => {
													// TODO DESTROY PEER HERE
													// destroyPeer("Consultation ended")
													loadActiveAppointments(dispatch, _id)
												})
												.catch((error) => showError(dispatch, error))
										},
										onDeny: () => loadActiveAppointments(dispatch, _id),
										onDismiss: () => loadActiveAppointments(dispatch, _id),
									})
								}}
							>
								<FiPhoneOff size={20} color={"white"} />
							</div>
						</div>
					)}
				</div>
				<div style={{ ...center, marginBottom: "5px" }}>
					<div style={styles.muteButtons} onClick={modifyAudioAvailability}>
						{localAudioAvailable ? <FiMic color={"white"} /> : <FiMicOff color={"white"} />}
					</div>
					<div style={styles.callButton} onClick={() => setShowPowerOptions((showPowerOptions) => !showPowerOptions)}>
						<FiPower size={20} color={"white"} />
					</div>
					<div
						style={styles.muteButtons}
						onClick={() => {
							const { patient_id } = consultation.patient

							if (consultation.videoMode) {
								addDialog(dispatch, {
									dialog: SelectionDialog("Video control", "Confirm", videoAvailable ? "Disable video" : "Enable video", "Switch to audio mode"),
									onConfirm: () => {
										// * confirm button = "Disable video" / "Enable video" - to pause/enable video
										showSnack(dispatch, videoAvailable ? "Video disabled" : "Video enabled")
										props.setVideoAvailable(!videoAvailable)
										socket.emit("doctor_videoSignal", { signal: !videoAvailable, patient_id })
									},
									onDeny: () => {
										// * deny button = "Switch to audio mode"
										// * Note: Using fetch() to send this signal as onDeny() function
										// *       had disabled socket emitter
										doctor_switchToAudioMode(patient_id) // use fetch() to send signal
										setVideoMode(dispatch, false)
									},
								})
							} else {
								addDialog(dispatch, {
									dialog: GenericDialog("Switch to video mode?"),
									onConfirm: () => {
										socket.emit("video_mode_request", { doctor_id: _id, patient_id })
										showSnack(dispatch, "Sending video request to patient")
									},
								})
							}
						}}
					>
						{videoAvailable ? <FiVideo color={"white"} /> : <FiVideoOff color={"white"} />}
					</div>
				</div>
			</div>
		</Grow>
	)
}

ControlBar.propTypes = {
	show: PropTypes.bool,
	close: PropTypes.func,
	localAudioAvailable: PropTypes.bool,
	videoAvailable: PropTypes.bool,
	modifyAudioAvailability: PropTypes.func,
	setVideoAvailable: PropTypes.func,
}

const center = { display: "flex", justifyContent: "center", alignItems: "center" }
const controlButtons = { ...center, cursor: "pointer" }

const styles = {
	mainContainer: {
		...center,
		width: "100%",
		position: "absolute",
		bottom: "0px",
		backgroundColor: DARKGRAY,
		zIndex: 1000,
		flexDirection: "column",
	},
	controlButtonsContainer: {
		marginTop: "10px",
	},
	muteButtons: {
		...controlButtons,
		height: "50px",
		width: "50px",
		borderRadius: "25px",
		backgroundColor: "silver",
	},
	powerButtons: {
		...controlButtons,
		height: "40px",
		width: "40px",
		borderRadius: "20px",
		backgroundColor: "silver",
		marginLeft: "5px",
		marginRight: "5px",
	},
	callButton: {
		...controlButtons,
		height: "60px",
		width: "60px",
		borderRadius: "30px",
		backgroundColor: "red",
		marginLeft: "20px",
		marginRight: "20px",
	},
}
export default ControlBar
