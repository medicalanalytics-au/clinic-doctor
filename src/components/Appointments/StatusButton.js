/**
 * Dashboard -> Appointments -> StatusButton
 * Appointment status displayed on <Row/>
 */

import "../../App.css"
import PropTypes from "prop-types"
import { AMBER, GREEN, RED, REQUESTSTATUS } from "../../utils/constants"

const StatusButton = (props) => {
	const { label, status } = props

	let color
	switch (status) {
		case undefined: // no patient status = online clinic
			color = GREEN
			break
		case REQUESTSTATUS.CONFIRMED:
			color = GREEN
			break
		case REQUESTSTATUS.MISSED:
			color = RED
			break
		case REQUESTSTATUS.CANCELLED:
			color = RED
			break
		default:
			color = AMBER
			break
	}

	return (
		<div style={{ ...styles.statusButton, border: "1px solid " + color }}>
			<div style={{ color: props.color }}>{label === "online" ? "online clinic" : label}</div>
		</div>
	)
}
StatusButton.propTypes = {
	label: PropTypes.string,
	status: PropTypes.string,
	color: PropTypes.string,
}

const styles = {
	statusButton: {
		fontWeight: "bold",
		borderRadius: "5px",
		width: "100px",
		height: "32px",
		textAlign: "center",
		fontSize: "10px",
		paddingLeft: "5px",
		paddingRight: "5px",
		display: "flex",
		flexDirection: "center",
		justifyContent: "center",
		alignItems: "center",
	},
}
export default StatusButton
