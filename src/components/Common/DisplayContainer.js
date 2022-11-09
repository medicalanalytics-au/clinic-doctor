/**
 * Icon selections on right side of screen (Settings/Logout)
 */

import { useContext, useState } from "react"
import "../../App.css"
import PropTypes from "prop-types"

// material ui
import { IconButton, Tooltip } from "@mui/material"

// react icons
import { RiLogoutCircleRLine } from "react-icons/ri"
import { IoSettingsOutline } from "react-icons/io5"

// icon
import settings from "../../images/settings.png"

// context
import { closeManageDoctorsScreen, logout } from "../../utils/context"
import { ProfileContext } from "../../App"

// Swal
import Swal from "sweetalert2"
import { GenericDialog, GenericError } from "../../utils/sweetalertDialogs"

import Settings from "../Dashboard/Settings"
import ModalScreen from "./ModalScreen"
import ManageDoctors from "../Settings/ManageDoctors/ManageDoctors"

const DisplayHeader = (props) => {
	const { state, dispatch } = useContext(ProfileContext)
	const { showManageDoctorsScreen } = state

	const [modalOpen, setModalOpen] = useState(false)

	return (
		<div style={styles.header}>
			<ModalScreen
				icon={settings}
				open={showManageDoctorsScreen}
				close={() => closeManageDoctorsScreen(dispatch)}
				closeIcon={true}
				content={<ManageDoctors close={() => closeManageDoctorsScreen(dispatch)} />}
				title={"Manage Doctors"}
			/>

			<ModalScreen
				icon={settings}
				open={modalOpen}
				close={() => setModalOpen(false)}
				closeIcon={true}
				content={<Settings close={() => setModalOpen(false)} />}
				title={"Settings"}
			/>

			<div style={{ marginLeft: "10px" }}>{props.title}</div>
			<div style={{ display: "flex", flexDirection: "row" }}>
				{props.extraComponent && props.extraComponent}

				<Tooltip title="Settings">
					<IconButton onClick={() => setModalOpen(true)}>
						<IoSettingsOutline />
					</IconButton>
				</Tooltip>
				<Tooltip title="Logout">
					<IconButton
						onClick={() =>
							Swal.fire(GenericDialog("Logout?"))
								.then((result) => result.isConfirmed && logout(dispatch))
								.catch((error) => Swal.fire(GenericError(error)))
						}
					>
						<RiLogoutCircleRLine />
					</IconButton>
				</Tooltip>
			</div>
		</div>
	)
}

DisplayHeader.propTypes = {
	extraComponent: PropTypes.object,
	title: PropTypes.string,
}

const DisplayContainer = (props) => {
	return (
		<div style={styles.mainContainer}>
			<div className="dashboardInnerContainer">
				<DisplayHeader title={props.title} extraComponent={props.extraComponent} />
				<div style={styles.body}>{props.children}</div>
			</div>
		</div>
	)
}
DisplayContainer.propTypes = {
	extraComponent: PropTypes.object,
	title: PropTypes.string,
}

const styles = {
	mainContainer: {
		height: "100vh",
		width: "100vw",
		top: "0px",
		left: "0px",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		position: "absolute",
		zIndex: 1,
		flexDirection: "column",
		overflow: "hidden",
	},
	header: {
		margin: "10px",
		fontWeight: "bold",
		color: "black",
		width: "98%",
		letterSpacing: "0.2em",
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	body: {
		margin: "10px",
		width: "98%",
		height: "100%",
		letterSpacing: "0.1em",
		position: "relative",
	},
}
export default DisplayContainer
