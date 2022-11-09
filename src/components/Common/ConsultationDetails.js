/**
 * Consultation details
 */

import { useContext, useEffect, useState } from "react"
import "../../App.css"
import PropTypes from "prop-types"
import { DateTime } from "luxon"

// material ui
import { Button, Table, TableBody, TableCell, TableContainer, TableRow, TextField } from "@mui/material"

// network
import { doctor_getConsultationDetails } from "../../utils/network"

// custom functions
import {
	millisToHoursMinutesSeconds,
	mobile,
	mobileLandscape,
	mobilePortrait,
	showError,
	tabletPortrait,
	useResponsiveMedia,
} from "../../utils/helpers"

// constants
import { AMBER, blankConsultationDetails, center, MAINCOLOR_LIGHT, RED } from "../../utils/constants"

// custom components
import Tabs from "./Tabs"

// context
import { ProfileContext } from "../../App"

// TODO: ------------------- Separate components into different files

// TODO: check relevance of completedDate
const Notes = ({ data, completedDate }) => {
	const media = useResponsiveMedia()

	if (data) {
		const { saved, status, text } = data

		return (
			<div style={notesStyles.mainContainer}>
				{!saved && saved !== undefined && <div style={notesStyles.draftCaption}>DRAFT</div>}
				{status === "Warning" && <div style={notesStyles.warningCaption}>WARNING</div>}
				<TextField
					value={text?.length > 0 ? text : "No notes recorded"}
					fullWidth
					maxRows={mobileLandscape(media) ? 3 : tabletPortrait(media) ? 25 : 15}
					multiline
					variant="standard"
					InputProps={{ disableUnderline: true }}
					style={{ margin: "10px" }}
				/>
			</div>
		)
	} else return <div>No notes recorded</div>
}

const Prescriptions = ({ data }) => {
	if (data.length > 0) {
		return (
			<div>
				<TableContainer>
					<Table>
						<TableBody>
							{data.map((i) => {
								return (
									<TableRow key={i._id}>
										<TableCell>
											<div style={{ display: "flex", flexDirection: "column" }}>
												<div style={{ display: "flex", flexDirection: "row", fontWeight: "bold" }}>
													<div style={{ marginRight: "10px" }}>{i.medication}</div>
													<div>{i.strength}</div>
												</div>
												<div>{i.substitutionAllowed && "Substitution Allowed"}</div>
												<div style={{ display: "flex", flexDirection: "row" }}>
													<div style={{ marginRight: "10px" }}>Quantity</div>
													<div>{i.quantity}</div>
												</div>
												{i.refill > 0 && (
													<div style={{ display: "flex", flexDirection: "row" }}>
														<div style={{ marginRight: "10px" }}>Refill</div>
														<div>{i.refill}</div>
													</div>
												)}
												<div>{i.sig && i.sig}</div>
											</div>
										</TableCell>
									</TableRow>
								)
							})}
						</TableBody>
					</Table>
				</TableContainer>
			</div>
		)
	} else return <div>No prescriptions recorded</div>
}

export const ConsultationDetails = (props) => {
	const { dispatch } = useContext(ProfileContext)

	const [consultationDetails, setConsultationDetails] = useState(blankConsultationDetails)

	const { clinic_address, clinic_name, completedDate, datetime, doctor_name, prescriptions, notes } = consultationDetails

	useEffect(() => {
		doctor_getConsultationDetails(dispatch, props.id)
			.then((res) => setConsultationDetails(res))
			.catch((error) => showError(dispatch, error))
	}, [props.id, dispatch])

	const media = useResponsiveMedia()

	const tabs = [
		{ title: "Notes", screen: <Notes data={notes} completedDate={completedDate} /> },
		{ title: "Prescriptions", screen: <Prescriptions data={prescriptions} /> },
	]

	const duration = completedDate ? millisToHoursMinutesSeconds(completedDate - datetime) : 0

	return (
		<div style={styles.mainContainer}>
			<div style={{ margin: mobilePortrait(media) ? 0 : "0.5em", height: "80%" }}>
				<div style={styles.header}>{consultationDetails.patient_name}</div>
				<div style={{ marginLeft: "5px" }}>
					<div style={styles.dateline}>{DateTime.fromMillis(datetime).toLocaleString(DateTime.DATE_SHORT)}</div>
					<div style={styles.timeline}>
						<div>{DateTime.fromMillis(datetime).toLocaleString(DateTime.TIME_SIMPLE)}</div>
						{completedDate ? (
							<div style={{ display: "flex", flexDirection: "row" }}>
								<div style={styles.dash}>-</div>
								<div style={{ marginRight: "5px" }}>{DateTime.fromMillis(completedDate).toLocaleString(DateTime.TIME_SIMPLE)}</div>
								<div style={styles.duration}>
									<div style={styles.durationLabel}>(Duration</div>
									{duration.hours ? <div style={{ marginRight: "3px" }}>{duration.hours + " hr "} </div> : ""}
									{duration.minutes ? <div style={{ marginRight: "3px" }}>{duration.minutes + "m"} </div> : ""}
									{duration.seconds ? <div>{duration.seconds + "s"} </div> : ""}
									<div>)</div>
								</div>
							</div>
						) : (
							<div style={{ fontStyle: "italic", marginLeft: "5px" }}>(In Session)</div>
						)}
					</div>
					<div style={styles.doctorName}>{doctor_name}</div>
					<div style={{ marginBottom: "0.2em" }}>{clinic_name}</div>
					<div style={{ marginBottom: "0.5em" }}>{clinic_address}</div>
				</div>

				<Tabs content={tabs} />
			</div>
			{!mobile(media) && (
				<div style={{ ...center }}>
					<Button variant="contained" style={{ width: "100px" }} onClick={props.close}>
						Close
					</Button>
				</div>
			)}
		</div>
	)
}

ConsultationDetails.propTypes = {
	id: PropTypes.string,
	close: PropTypes.func,
}

const styles = {
	mainContainer: {
		color: "gray",
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
		height: "100%", //
	},
	header: {
		color: "white",
		fontWeight: "bold",
		fontSize: "1.3em",
		marginBottom: "0.5em",
		padding: "0.5em",
		backgroundColor: MAINCOLOR_LIGHT,
	},
	dateline: {
		fontWeight: "bold",
		marginBottom: "0.2em", //
	},
	timeline: {
		display: "flex",
		flexDirection: "row",
		marginBottom: "0.5em", //
	},
	dash: {
		marginLeft: "5px",
		marginRight: "5px", //
	},
	duration: {
		display: "flex",
		flexDirection: "row",
		fontStyle: "italic", //
	},
	durationLabel: {
		fontStyle: "italic",
		marginRight: "5px", //
	},
	doctorName: {
		fontWeight: "bold",
		marginBottom: "0.2em", //
	},
}

const notesStyles = {
	mainContainer: { ...center, flexDirection: "column", padding: "10px" },
	draftCaption: {
		...center,
		color: AMBER,
		margin: "5px",
		fontWeight: "bold",
		backgroundColor: "silver",
		width: "100%",
		padding: "10px",
	},
	warningCaption: { margin: "5px", fontWeight: "bold", color: RED },
}
export default ConsultationDetails
