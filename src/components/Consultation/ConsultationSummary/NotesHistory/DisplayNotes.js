import "../../../../App.css"
import PropTypes from "prop-types"

// material ui
import { Button } from "@mui/material"

// custom functions
import { BLACK, center, RED } from "../../../../utils/constants"

const DisplayNotes = (props) => {
	return (
		<div style={styles.mainContainer}>
			<div style={styles.innerContainer}>
				<div style={styles.header}>
					{props.notes.status === "Warning" && <div style={styles.warning}>Warning</div>}
					<div style={styles.doctorDetails}>
						<div style={{ fontWeight: "bold" }}>{props.notes.doctor_name}</div>
						<div>{props.notes.clinic_name}</div>
						<div>{props.notes.clinic_address}</div>
					</div>
				</div>
				<div style={styles.textBox}>{props.notes.text}</div>
			</div>
			<div style={styles.buttonContainer}>
				<Button variant="outlined" onClick={props.close}>
					Close
				</Button>
			</div>
		</div>
	)
}

DisplayNotes.propTypes = {
	close: PropTypes.func,
	notes: PropTypes.object,
}

const styles = {
	mainContainer: {
		width: "100%",
		height: "100%",
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
	},
	innerContainer: {
		width: "100%",
		height: "90%",
		display: "flex",
		flexDirection: "column",
	},
	header: {
		display: "flex",
		flexDirection: "row",
	},
	warning: {
		...center,
		color: RED,
		marginRight: "10px",
	},
	doctorDetails: {
		display: "flex",
		flexDirection: "column",
		marginLeft: "5px",
		fontSize: "10px",
		color: BLACK,
	},
	textBox: {
		border: "1px solid silver",
		height: "100%",
		marginTop: "10px",
		padding: "10px",
		borderRadius: "5px",
	},
	buttonContainer: {
		display: "flex",
		justifyContent: "flex-end",
	},
}

export default DisplayNotes
