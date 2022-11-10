/**
 * To replace all <DashboardModal/>
 *
 * This screen adjusts to different screen types
 * It displays a spinner internally, and blocks the main screen spinner by setting a context state - modalScreenActive: true
 */

import { useContext, useEffect } from "react"
import "../../App.css"
import PropTypes from "prop-types"

// material ui
import { Modal } from "@mui/material"

// react-spinners
import { BeatLoader } from "react-spinners"

// custom component
import Header from "./Header"

// context
import { ProfileContext } from "../../App"
import { setModalScreenActive } from "../../utils/context"

// constants
import { center, GRAY, MAINCOLOR } from "../../utils/constants"

const ModalScreen = (props) => {
	const { state, dispatch } = useContext(ProfileContext)
	const { show, text } = state.spinner

	const { open, close, closeIcon, icon, title, content } = props

	useEffect(() => {
		// * Prevents Spinner from displaying if ModalScreen is active, as another spinner will be displayed in the ModalScreen box
		setModalScreenActive(dispatch, open || false)
	}, [open, dispatch])

	return (
		<Modal className="glass" open={open} onClose={() => close()} disableEscapeKeyDown={closeIcon === false}>
			<div style={styles.overlay}>
				<div className="ModalScreen" style={{ position: "relative" }}>
					<Header closeIcon={closeIcon} icon={icon} title={title} close={() => close()} />

					{content}
					{show && (
						<div style={styles.bottomSpinner}>
							<BeatLoader color={MAINCOLOR} />
							<div style={{ fontSize: "10px", color: GRAY }}>{text}</div>
						</div>
					)}
				</div>
			</div>
		</Modal>
	)
}

ModalScreen.propTypes = {
	open: PropTypes.bool,
	close: PropTypes.func,
	content: PropTypes.node,
	closeIcon: PropTypes.bool,
	icon: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
	title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
}

const styles = {
	overlay: {
		height: "100%",
		width: "100%",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
	bottomSpinner: {
		...center,
		flexDirection: "column",
		position: "absolute",
		bottom: "10px",
		width: "100%",
		zIndex: 10000, 
	},
}
export default ModalScreen
