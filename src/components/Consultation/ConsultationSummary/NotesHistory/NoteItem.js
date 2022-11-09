import "../../../../App.css"
import PropTypes from "prop-types"
import { DateTime } from "luxon"

// material ui
import { IconButton } from "@mui/material"

// React Icons
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md"

import { AMBER, RED } from "../../../../utils/constants"

const NoteItem = (props) => {
	const { datetime, notes, doctor_name } = props.item
	const { saved, status, text } = notes

	const styles = {
		...subStyles,
		mainContainer: {
			...supportStyles.mainContainer,
			fontSize: props.mobile ? "10px" : "15px",
		},
		draftStatus: {
			...supportStyles.draftStatus,
			display: saved ? "none" : "flex",
		},
		warningStatus: {
			...supportStyles.warningStatus,
			display: status === "Warning" ? "flex" : "none",
		},
		text: {
			fontSize: "13px",
			fontStyle: saved ? "normal" : "italic",
			height: props.collapsed ? 0 : "1.5em",
		},
	}

	return (
		<div style={styles.mainContainer} onClick={() => props.onClick()}>
			<div style={styles.textContainer}>
				<div style={styles.header}>
					{!props.collapsed && <div style={styles.warningStatus}>WARNING</div>}
					{!props.collapsed && <div style={styles.draftStatus}>Draft</div>}
				</div>
				<div style={{ display: "flex", flexDirection: "row" }}>
					<div style={styles.dateLine}>{DateTime.fromMillis(datetime).toLocaleString(DateTime.DATETIME_SHORT)}</div>
					{saved && <div>{doctor_name}</div>}
				</div>
				{!props.collapsed && <div style={styles.text}>{text}</div>}
			</div>
			<div style={{ height: "100%" }}>
				<IconButton onClick={() => props.onCollapseChange()}>{props.collapsed ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}</IconButton>
			</div>
		</div>
	)
}

NoteItem.propTypes = {
	item: PropTypes.object,
	onCollapseChange: PropTypes.func,
	onClick: PropTypes.func,
	collapsed: PropTypes.bool,
	mobile: PropTypes.bool,
}

const supportStyles = {
	mainContainer: {
		display: "flex",
		flexDirection: "row",
		overflow: "hidden",
		justifyContent: "space-between",
		marginTop: "10px",
		marginBottom: "10px",
	},
	draftStatus: {
		color: AMBER,
		marginRight: "5px",
		fontStyle: "italic",
	},
	warningStatus: {
		color: RED,
		marginRight: "5px",
		fontWeight: "bold",
	},
}

const subStyles = {
	textContainer: {
		display: "flex",
		flexDirection: "column",
		fontSize: "12px",
		padding: "5px",
	},
	header: {
		display: "flex",
		flexDirection: "row",
	},
	dateLine: {
		fontWeight: "bold",
		marginRight: "5px",
	},
}
export default NoteItem
