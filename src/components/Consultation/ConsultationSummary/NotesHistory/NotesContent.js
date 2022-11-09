import "../../../../App.css"
import PropTypes from "prop-types"

// custom components
import AddNotes from "./AddNotes"
import DisplayNotes from "./DisplayNotes"

const NotesContent = (props) => {
	return (
		<div style={styles.mainContainer}>
			{props.notes._id !== props.appointment_id ? (
				<DisplayNotes notes={props.notes} close={props.close} />
			) : (
				<AddNotes notes={props.notes} onSaved={props.onSaved} />
			)}
		</div>
	)
}

NotesContent.propTypes = {
	close: PropTypes.func,
	onSaved: PropTypes.func,
	appointment_id: PropTypes.string,
	notes: PropTypes.object,
}

const styles = {
	mainContainer: {
		height: "100%",
		margin: "10px",
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
	},
}

export default NotesContent
