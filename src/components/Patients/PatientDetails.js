import React, { useContext } from "react"
import "../../App.css"
import PropTypes from "prop-types"

// material ui
import { Button } from "@mui/material"

// constant
import { center } from "../../utils/constants"

// custom components
import Tabs from "../Common/Tabs"
import { Allergies, Consultation, MedicalHistory, Notes, Prescriptions } from "./PatientDetails_TabScreens"
import { ProfileContext } from "../../App"

const PatientDetails = (props) => {
	const { state } = useContext(ProfileContext)
	const { consultation } = state
	const { patient } = consultation
	const { allergies, medicalHistory, history } = patient

	const prescriptions = history.filter((i) => i.prescriptions.length > 0 && i)
	const notes = history.filter((i) => i.notes && Object.keys(i.notes).length > 0 && i)

	const tabs = [
		{ title: "Allergies", screen: <Allergies data={allergies} /> },
		{ title: "Medical History", screen: <MedicalHistory data={medicalHistory} /> },
		{ title: "Prescriptions", screen: <Prescriptions data={prescriptions} /> },
		{ title: "Notes", screen: <Notes data={notes} /> },
		{ title: "Consultations", screen: <Consultation data={history} /> },
	]

	return (
		<div style={styles.mainContainer}>
			<div style={{ height: "100%" }}>
				<Tabs content={tabs} />
			</div>
			<div style={{ ...center }}>
				<Button variant="contained" style={{ width: "100px" }} onClick={props.close}>
					Close
				</Button>
			</div>
		</div>
	)
}

PatientDetails.propTypes = {
	id: PropTypes.string,
	close: PropTypes.func,
}

const styles = {
	mainContainer: {
		height: "100%",
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
	},
}

export default PatientDetails
