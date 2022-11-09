import "../../../App.css"
import { useCallback, useContext, useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"

// images
import user from "../../../images/user.jpg"
import logo from "../../../images/medicalanalyticstransparentbackground.png"

// material ui
import { IconButton, Modal } from "@mui/material"

// react icons
import { FiMicOff, FiVideoOff } from "react-icons/fi"
import { IoCloseOutline } from "react-icons/io5"

import { center, GRAY, MAINCOLOR, MEDIA, OFFBLACK, SILVER, WHITE } from "../../../utils/constants"

// context
import { ProfileContext } from "../../../App"
import { setSessionEndTime, setShowDoctorsNotes, setStream, setSessionPaused, setVideoMode } from "../../../utils/context"

// Swal
import { addDialog } from "../../../utils/context"
import { GenericAlert, GenericError } from "../../../utils/sweetalertDialogs"

// custom functions
import { doctor_checkSessionExtendable, doctor_extendSessionTime } from "../../../utils/network"

// snackbox
import { showSnack } from "../../../utils/context"

// custom components
import ExtendSessionBox from "../ExtendSessionBox"
import PatientDetails from "../../Patients/PatientDetails"
import ModalScreen from "../../Common/ModalScreen"
import MenuBox from "../MenuBox"
import Menubar from "./Menubar"
import ControlBar from "./ControlBar"

// custom function
import { showError, useResponsiveMedia } from "../../../utils/helpers"

const SplashBackgroundScreen = (props) => {
	const { state } = useContext(ProfileContext)
	const { videoMode } = state.consultation

	const styles = {
		...subStyles.SplashBackgroundScreen,
	}

	return (
		<div style={styles.mainContainer} onClick={props.onClick && props.onClick}>
			<img src={logo} alt="logo" width="60%" />
			<div style={styles.statusText}>{props.status}</div>
			{props.menuBar && props.menuBar}
			{!videoMode && <div style={styles.audioModeStatus}>Audio mode</div>}
			<div style={{ color: WHITE, fontSize: "12px", display: "flex", flexDirection: "column" }}>
				{!props.peerAudio && (
					<div style={{ display: "flex", flexDirection: "row" }}>
						<div style={{ marginRight: "5px", marginTop: "2px" }}>
							<FiMicOff />
						</div>
						<div>Patient</div>
					</div>
				)}
				{!props.localAudio && (
					<div style={{ display: "flex", flexDirection: "row" }}>
						<div style={{ marginRight: "5px", marginTop: "2px" }}>
							<FiMicOff />
						</div>
						<div>Doctor</div>
					</div>
				)}
			</div>
		</div>
	)
}

SplashBackgroundScreen.propTypes = {
	status: PropTypes.string,
	onClick: PropTypes.func,
	menuBar: PropTypes.object,
	localAudio: PropTypes.bool,
	peerAudio: PropTypes.bool,
}

const VideoScreen = (props) => {
	const { state, dispatch } = useContext(ProfileContext)

	const { socket, videoScreenStatus, stream, videoScreenVisible, peerVideoStream, consultation, session } = state

	const { patient, doctor_appointment_id, videoMode } = consultation
	const { sessionPaused } = session // TODO switch to consultationPaused

	const media = useResponsiveMedia()
	const mobile = media.type === MEDIA.MOBILE
	const tablet = media.type === MEDIA.TABLET

	const peerVideo = useRef()

	const [localAudioAvailable, setLocalAudioAvailable] = useState(true)
	const [videoAvailable, setVideoAvailable] = useState(true)
	const [peerAudioAvailable, setPeerAudioAvailable] = useState(true)
	const [peerVideoAvailable, setPeerVideoAvailable] = useState(true)

	const localVideo = useCallback((node) => node && (node.srcObject = stream), [stream])

	const [availableTime, setAvailableTime] = useState()
	const [showExtendSessionBox, setShowExtendSessionBox] = useState(false)
	const [showMenu, setShowMenu] = useState(false)

	const [showPatientDetails, setShowPatientDetails] = useState(false)

	const [showControlBar, setShowControlBar] = useState(false)

	const endTimeUpdated = useRef(null)

	const styles = {
		...subStyles,
		localVideoContainer: {
			...supportStyles.localVideoContainer,
			width: mobile ? "30%" : tablet ? "20%" : "10%",
		},
	}

	const modifyAudioAvailability = () => {
		// * audio mute
		socket.emit("doctor_audioSignal", { signal: !localAudioAvailable, appointment_id: doctor_appointment_id })
		setLocalAudioAvailable((localAudioAvailable) => !localAudioAvailable)
	}

	useEffect(() => {
		socket.on("patient_audioSignal", (signal) => {
			setPeerAudioAvailable(signal)
		})
		socket.on("patient_videoSignal", (signal) => {
			setVideoMode(dispatch, signal)
		})
	}, [socket, dispatch, localAudioAvailable, videoScreenStatus])

	useEffect(() => {
		// this will set the video to the screen
		if (peerVideo.current) peerVideo.current.srcObject = peerVideoStream
	}, [peerVideoStream])

	useEffect(() => {
		// same as above but it refreshes the screen when the videoMode is changed
		if (videoMode && peerVideo.current && !sessionPaused) {
			console.log("this runs too. refreshing")
			peerVideo.current.srcObject = peerVideoStream
		}
	}, [videoMode, peerVideoStream, sessionPaused])

	/* useEffect(() => {
		if (peerVideo.current && videoMode) peerVideo.current.srcObject = peerVideoStream
	}, [peerVideoStream, videoMode]) */

	useEffect(() => {
		// * set up local video when videoscreen is set to open
		if (props.open) {
			const constraints = {
				video: {
					frameRate: {
						ideal: 25,
						max: 25,
					},
				},
				audio: true,
			}
			navigator.mediaDevices.getUserMedia(constraints).then((videostream) => {
				setStream(dispatch, videostream)
			})
		}
	}, [props.open, dispatch])

	useEffect(() => {
		if (stream) {
			stream.getVideoTracks()[0].enabled = videoAvailable && !sessionPaused
			stream.getAudioTracks()[0].enabled = localAudioAvailable && !sessionPaused
		}
	}, [localAudioAvailable, videoAvailable, stream, videoMode, dispatch, sessionPaused])

	useEffect(() => {
		socket.on("extendSessionTimeRequest_accepted", (args) => {
			setSessionEndTime(dispatch, args.endTime)

			addDialog(dispatch, {
				dialog: GenericAlert("Session had been extended by " + args.extendBy + " minutes"),
			})
		})

		socket.on("extendSessionTimeRequest_rejected", (args) => {
			addDialog(dispatch, {
				dialog: GenericAlert("Session extension request had been rejected"),
			})
		})
		socket.on("extendSessionTimeRequest_timeout", (args) => {
			addDialog(dispatch, {
				dialog: GenericAlert("Session extension request timeout"),
			})
		})
	}, [socket, dispatch])

	const extendSession = () => {
		doctor_checkSessionExtendable(dispatch, doctor_appointment_id)
			.then((res) => {
				if (res.length === 0) {
					addDialog(dispatch, {
						dialog: GenericAlert("Upcoming consultation exists", "Unable to extend session"),
					})
				} else {
					if (res[0] === "no_extension_available") {
						addDialog(dispatch, {
							dialog: GenericError("No further extension available"),
						})
					} else {
						setAvailableTime(res)
						setShowExtendSessionBox(true)
					}
				}
			})
			.catch((error) => showError(dispatch, error))
	}

	const displayExtendSessionBox = (time) => {
		setAvailableTime(time)
		setShowExtendSessionBox(true)
	}

	const menu = [
		{
			label: "Patient",
			onClick: () => setShowPatientDetails(true),
		},
		{
			label: "Consultation Overview",
			onClick: () => {
				setShowDoctorsNotes(dispatch, true)
			},
		},
		{
			label: "Extend Session",
			onClick: extendSession,
		},
	]

	const handleControlBar = () => {
		const hideControlBar = () => setShowControlBar(false)
		!showControlBar && setTimeout(hideControlBar, 5000)
		setShowControlBar(!showControlBar)
	}

	const handleSessionExtend = (time) => {
		endTimeUpdated.current = null
		if (time === 5) {
			doctor_extendSessionTime(dispatch, doctor_appointment_id, 5)
				.then((res) => {
					setSessionEndTime(dispatch, res.endTime)
					addDialog(dispatch, {
						dialog: GenericAlert("Session had been extended by 5 minutes"),
					})
				})
				.catch((error) => showError(dispatch, error))
		} else {
			// use socket.io to request as Patient is required to respond
			socket.emit("doctor_extendSessionTimeRequest", { appointment_id: doctor_appointment_id, extendBy: 15 })
			showSnack(dispatch, "Extension request sent to patient")
		}
	}

	return (
		<Modal open={props.open}>
			<div style={styles.mainContainer}>
				<ExtendSessionBox
					open={showExtendSessionBox}
					close={() => setShowExtendSessionBox(false)}
					availableTime={availableTime}
					onExtend={handleSessionExtend}
				/>

				<MenuBox open={showMenu} close={() => setShowMenu(false)} menu={menu} />

				<ModalScreen
					icon={user}
					open={showPatientDetails}
					close={() => setShowPatientDetails(false)}
					content={<PatientDetails id={patient.patient_id} close={() => setShowPatientDetails(false)} />}
					title={patient.name}
				/>

				<div style={styles.innerContainer}>
					{videoScreenVisible && <Menubar displayExtendSessionBox={displayExtendSessionBox} setShowMenu={setShowMenu} />}

					<div
						style={{
							position: "absolute",
							top: "10px",
							right: "20px",
							zIndex: 100,
						}}
					>
						<IconButton
							onClick={() => {
								// socket.emit("patient_pause_consultation", currentAppointment)
								setSessionPaused(dispatch, true)
								props.close()
							}}
						>
							<IoCloseOutline />
						</IconButton>
					</div>

					<ControlBar
						show={showControlBar}
						close={props.close}
						localAudioAvailable={localAudioAvailable}
						videoAvailable={videoAvailable}
						modifyAudioAvailability={modifyAudioAvailability}
						setVideoAvailable={setVideoAvailable}
					/>

					{videoMode && videoScreenVisible && (
						<div style={styles.localVideoContainer}>
							<div style={styles.muteIconsContainer}>
								{!localAudioAvailable && <FiMicOff size={30} color={SILVER} style={styles.muteIcons} />}
								{!videoAvailable && <FiVideoOff size={30} color={SILVER} style={styles.muteIcons} />}
							</div>
							<video ref={localVideo} playsInline muted autoPlay style={styles.localVideo} />
						</div>
					)}

					{videoMode && videoScreenVisible && !sessionPaused ? (
						<video ref={peerVideo} playsInline autoPlay style={styles.peerVideo} onClick={handleControlBar} />
					) : (
						<SplashBackgroundScreen
							onClick={handleControlBar}
							menuBar={<Menubar displayExtendSessionBox={displayExtendSessionBox} setShowMenu={setShowMenu} />}
							status={videoScreenStatus}
							localAudio={localAudioAvailable}
							peerAudio={peerAudioAvailable}
						/>
					)}

					{videoScreenVisible && videoMode && (
						<div style={styles.muteIconsIndicators}>
							{!peerAudioAvailable && <FiMicOff size={50} color={SILVER} style={styles.muteIcons} />}
							{!peerVideoAvailable && <FiVideoOff size={50} color={SILVER} style={styles.muteIcons} />}
						</div>
					)}
				</div>
			</div>
		</Modal>
	)
}

VideoScreen.propTypes = {
	open: PropTypes.bool,
	close: PropTypes.func,
}

const supportStyles = {
	localVideoContainer: {
		...center,
		top: "10px",
		left: "10px",
		position: "absolute",
		objectFit: "cover",
		width: "10%",
		height: "20%",
		border: "3px solid silver",
		borderRadius: "15px",
		zIndex: 1000,
	},
}

const subStyles = {
	mainContainer: {
		...center,
		width: "100%",
		height: "100%",
		backgroundColor: SILVER,
	},
	innerContainer: {
		...center,
		border: "1px solid " + MAINCOLOR,
		height: "95%",
		width: "98%",
		borderRadius: "5px",
		position: "relative",
		backgroundColor: "white",
	},
	loadingScreen: {
		...center,
		height: "100%",
		width: "100%",
		border: "1px solid green",
		position: "absolute",
	},
	localVideo: {
		...center,
		objectFit: "cover",
		width: "100%",
		height: "100%",
		transform: "scaleX(-1)",
		borderRadius: "15px",
		zIndex: 1000,
	},
	peerVideo: {
		height: "100%",
		width: "100%",
		left: 0,
		top: 0,
		position: "absolute",
		transform: "scaleX(-1)",
		objectFit: "cover",
		zIndex: 800,
	},
	muteIconsContainer: {
		...center,
		position: "absolute",
		zIndex: 2000,
		color: GRAY,
	},
	muteIcons: {
		marginLeft: "20px",
		marginRight: "20px",
	},
	muteIconsIndicators: {
		display: "flex",
		flexDirection: "row",
		zIndex: 1000,
	},
	muteButtons: {
		...center,
		cursor: "pointer",
		height: "50px",
		width: "50px",
		borderRadius: "25px",
		backgroundColor: SILVER,
	},
	SplashBackgroundScreen: {
		mainContainer: {
			height: "100%",
			width: "100%",
			...center,
			backgroundColor: OFFBLACK,
			flexDirection: "column",
			position: "relative",
		},
		statusText: {
			color: WHITE,
			fontWeight: "bold",
			fontSize: "20px",
			marginTop: "20px",
		},
		audioModeStatus: {
			/* 	position: "absolute",
			top: "10%", */
			color: WHITE,
			marginBottom: "10px",
		},
	},
}
export default VideoScreen
