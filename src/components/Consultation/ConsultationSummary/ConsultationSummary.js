import { useContext } from "react"
import "../../../App.css"
import PropTypes from "prop-types"
import Countdown from "react-countdown"

// material ui
import { Button } from "@mui/material"

// react icons
import { FaNotesMedical, FaFilePrescription, FaLock } from "react-icons/fa"

// context
import { ProfileContext } from "../../../App"

// custom functions
import { loadAppointments, mobile, mobileLandscape, mobilePortrait, now, renderer, showError, useResponsiveMedia } from "../../../utils/helpers"

// custom components
import Tabs from "../../Common/Tabs"
import NotesHistory from "./NotesHistory/NotesHistory"
import PrescriptionHistory from "./PrescriptionHistory/PrescriptionHistory"
import SpeedButton from "../../Common/SpeedButton"

// constants
import { center, CLINIC_OPEN_PERIOD, MAINCOLOR_LIGHT } from "../../../utils/constants"

// Swal
import { addDialog } from "../../../utils/context"
import { GenericDialog } from "../../../utils/sweetalertDialogs"

// network
import { doctor_closeConsultation } from "../../../utils/network"

const Summary = () => {
	const { state } = useContext(ProfileContext)
	const { text } = state.consultation.summary

	return text ? <div style={styles.synopsis}>{text}</div> : <div style={styles.noInfo}>No synopsis available</div>
}

const Image = () => {
	const { state } = useContext(ProfileContext)
	const { image } = state.consultation.summary

	return image ? (
		<div style={styles.imageContainer}>{image && <img src={image} alt={"summary"} height={"100%"} style={styles.image} />}</div>
	) : (
		<div style={styles.noInfo}>No image available</div>
	)
}

const ConsultationSummary = (props) => {
	const { state, dispatch } = useContext(ProfileContext)
	const { consultation, _id, selectedMonth, selectedYear } = state
	const { endTime, closed, patient, doctor_appointment_id } = consultation

	const media = useResponsiveMedia()

	const tabs = [
		{ title: "Synopsis", screen: <Summary />, icon: <FaNotesMedical /> },
		{ title: "Image", screen: <Image />, icon: <FaNotesMedical /> },
		{ title: "Notes", screen: <NotesHistory />, icon: <FaNotesMedical /> },
		{ title: "Prescriptions", screen: <PrescriptionHistory />, icon: <FaFilePrescription /> },
	]

	const closeConsultationClick = () => {
		addDialog(dispatch, {
			dialog: GenericDialog("Close consultation now?", "This action is irreversible"),
			onConfirm: () => {
				doctor_closeConsultation(dispatch, doctor_appointment_id)
					.then(() => {
						loadAppointments(_id, selectedMonth, selectedYear, dispatch)
						props.close()
					})
					.catch((error) => showError(dispatch, error))
			},
		})
	}

	const notActiveAndUnClosed = closed === false && endTime < now()

	return (
		<div style={styles.mainContainer}>
			<div style={{ height: "100%", position: "relative" }}>
				{notActiveAndUnClosed && mobile(media) && (
					<div style={{ ...center, flexDirection: "row" }}>
						<div style={{ marginRight: "3px" }}>Consultation closing in</div>
						<div>
							<Countdown date={endTime + CLINIC_OPEN_PERIOD} renderer={renderer} />
						</div>
					</div>
				)}
				<div style={styles.header}>
					<div>{patient?.name}</div>
					{notActiveAndUnClosed && endTime + CLINIC_OPEN_PERIOD > now() && !mobile(media) && (
						<div style={{ ...center, flexDirection: "column" }}>
							<div>Consultation closing in</div>
							<div>
								<Countdown date={endTime + CLINIC_OPEN_PERIOD} renderer={renderer} />
							</div>
						</div>
					)}

					{notActiveAndUnClosed &&
						(mobilePortrait(media) ? (
							<SpeedButton icon={<FaLock />} onClick={closeConsultationClick} />
						) : (
							<Button style={{ color: "white" }} onClick={closeConsultationClick}>
								Close Consultation
							</Button>
						))}
				</div>
				<div style={{ position: "absolute", width: "100%", top: mobileLandscape(media) ? "80px" : "60px", bottom: "10px" }}>
					<Tabs content={tabs} />
				</div>
			</div>
		</div>
	)
}

const styles = {
	mainContainer: {
		display: "flex",
		flexDirection: "column",
		height: "100%",
		width: "100%",
		color: "black",
	},
	header: {
		color: "white",
		backgroundColor: MAINCOLOR_LIGHT,
		padding: "10px",
		marginBottom: "10px",
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	synopsis: {
		border: "1px solid silver",
		borderRadius: "5px",
		padding: "10px",
		height: "95%", ///
	},
	noInfo: {
		height: "100%",
		...center,
		border: "1px solid silver",
		borderRadius: "5px",
	},
	imageContainer: {
		display: "flex",
		...center,
		height: "100%",
		position: "relative", ///
	},
	image: {
		position: "absolute",
		top: 0, ///
	},
}

ConsultationSummary.propTypes = {
	close: PropTypes.func,
}
export default ConsultationSummary
