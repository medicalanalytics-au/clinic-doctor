import "../../../App.css"
import { useContext } from "react"
import PropTypes from "prop-types"

// react icons
import { MdMenu } from "react-icons/md"

import { center, DARKGRAY, MIN_3, WHITE } from "../../../utils/constants"

// context
import { ProfileContext } from "../../../App"

// Swal
import { addDialog } from "../../../utils/context"
import { GenericAlert, GenericDialog } from "../../../utils/sweetalertDialogs"

// custom functions
import { doctor_checkSessionExtendable } from "../../../utils/network"

// custom components
import TimeBox from "../TimeBox"
import { showError } from "../../../utils/helpers"

const Menubar = (props) => {
	const { state, dispatch } = useContext(ProfileContext)

	const { consultation, videoScreenVisible } = state
	const { doctor_appointment_id, endTime } = consultation

	return (
		<div style={styles.mainContainer}>
			<TimeBox
				color={WHITE}
				end={endTime}
				visible={videoScreenVisible}
				triggers={[MIN_3]}
				onTrigger={(time) => {
					if (time === MIN_3) {
						doctor_checkSessionExtendable(dispatch, doctor_appointment_id)
							.then((availableTime) => {
								if (availableTime.length === 0 || availableTime[0] === "no_extension_available") {
									addDialog(dispatch, {
										dialog: GenericAlert("Session expiring in 3 minutes"),
									})
								} else {
									addDialog(dispatch, {
										dialog: GenericDialog("Do you want to extend?", "Session expiring in 3 minutes"),
										onConfirm: () => {
											props.displayExtendSessionBox(availableTime)
										},
									})
								}
							})
							.catch((error) => showError(dispatch, error))
					}
				}}
			/>
			<div style={styles.menuIcon} onClick={() => props.setShowMenu(true)}>
				<MdMenu style={{ color: WHITE }} />
			</div>
		</div>
	)
}

Menubar.propTypes = {
	displayExtendSessionBox: PropTypes.func,
	setShowMenu: PropTypes.func,
}

const styles = {
	mainContainer: {
		...center,
		width: "100%",
		position: "absolute",
		bottom: "0px",
		backgroundColor: DARKGRAY,
		zIndex: 900,
		flexDirection: "column",
	},
	menuIcon: {
		position: "absolute",
		right: "10px",
		cursor: "pointer", ///
		fontSize: "20px",
		...center,
	},
}

export default Menubar
