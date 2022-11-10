/**
 * Spinner
 * - Mainly called from network._send() function
 * - will be blocked if modalScreenActive is true as <ModalScreen/> will display
 * - it's own spinner
 *
 * open/close through Context state
 */

import { useContext } from "react"
import PropTypes from "prop-types"
import "../../App.css"

// react-spinners
import RotateLoader from "react-spinners/RotateLoader"
import SyncLoader from "react-spinners/SyncLoader"

// material ui
import { Modal } from "@mui/material"

// constants
import { center, GRAY, MAINCOLOR, WHITE } from "../../utils/constants"

// context
import { ProfileContext } from "../../App"

const Spinner = (props) => {
	const { state } = useContext(ProfileContext)
	const { modalScreenActive } = state

	const { fullMode, open, color, text, lightFont } = props

	const transparency = fullMode ? "0.5" : "0"

	const styles = {
		overlay: {
			...supportStyles.overlay,
			backgroundColor: "rgba(0, 0, 0, " + transparency + ")",
			alignItems: fullMode ? "center" : "flex-end",
		},
		spinnerContainer: {
			...supportStyles.spinnerContainer,
			flexDirection: fullMode ? "column" : "row",
			marginBottom: fullMode ? "0px" : "100px",
		},
		text: {
			marginTop: fullMode ? "20px" : "0px",
			marginLeft: fullMode ? "0px" : "20px",
			color: lightFont ? WHITE : GRAY,
			fontWeight: "bold",
		},
	}

	return (
		<Modal open={open && !modalScreenActive} hideBackdrop>
			<div style={styles.overlay}>
				<div style={styles.spinnerContainer}>
					{fullMode ? <RotateLoader color={color || MAINCOLOR} loading={open} /> : <SyncLoader color={color || MAINCOLOR} loading={open} />}
					{text && <div style={styles.text}>{text}</div>}
				</div>
			</div>
		</Modal>
	)
}

Spinner.propTypes = {
	open: PropTypes.bool,
	text: PropTypes.string,
	color: PropTypes.string,
	fullMode: PropTypes.bool,
}

const supportStyles = {
	overlay: {
		height: "100vh",
		width: "100vw",
		display: "flex",
		justifyContent: "center",
	},
	spinnerContainer: {
		...center,
		display: "flex", 
	},
}
export default Spinner
