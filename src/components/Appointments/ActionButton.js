/**
 * Dashboard -> Appointments -> ActionButton
 * An action button located on individual row. Click to Pause/Resume/End consultation
 */

import { useState } from "react"
import "../../App.css"
import PropTypes from "prop-types"

// material ui
import { Button, Menu, MenuItem, useMediaQuery } from "@mui/material"
import { useTheme } from "@emotion/react"

// react icons
import { MdArrowDropDown, MdOutlineMoreVert } from "react-icons/md"

// custom functions
import { now } from "../../utils/helpers"

// constants
import { MIN_10, SESSION } from "../../utils/constants"

const ActionButton = (props) => {
	const [openActionMenu, setOpenActionMenu] = useState(false)
	const [anchorEl, setAnchorEl] = useState(null)

	// TODO: Change to useResponsiveMedia()
	const theme = useTheme()
	const mobile = useMediaQuery(theme.breakpoints.down("sm"))

	const { status, appointmentType, startTime, patient } = props.data

	const PopUpMenu = () => {
		
		// TODO: Move this out of main component

		const handleActionButtonClick = (event, action) => {
			event.stopPropagation()
			props.onClick(action)
			setOpenActionMenu(false)
			setAnchorEl(null)
		}

		const menuClose = () => {
			setOpenActionMenu(false)
			setAnchorEl(null)
		}

		const menuClick = (e) => {
			e.stopPropagation()
			setOpenActionMenu(false)
			setAnchorEl(null)
		}

		const pauseButtonClick = (event) => handleActionButtonClick(event, status === SESSION.STARTED ? "pause" : "resume")
		const stopButtonClick = (event) => handleActionButtonClick(event, "stop")
		const extendButtonClick = (event) => handleActionButtonClick(event, "extend")

		return (
			<Menu
				open={openActionMenu}
				anchorEl={anchorEl}
				onClose={menuClose}
				anchorOrigin={{
					vertical: "top",
					horizontal: "left",
				}}
				onClick={menuClick}
			>
				<MenuItem value="pause" onClick={pauseButtonClick}>
					{status === SESSION.STARTED ? "Pause Clinic" : "Resume Clinic"}
				</MenuItem>
				<MenuItem value="stop" onClick={stopButtonClick}>
					End Clinic
				</MenuItem>

				{appointmentType === "online" && (
					<MenuItem value="extend" onClick={extendButtonClick}>
						Modify Session Time
					</MenuItem>
				)}
			</Menu>
		)

		// * End of PopUpMenu
	}

	const handleActionClick = (e) => {
		setAnchorEl(e.currentTarget)
		e.stopPropagation()
		setOpenActionMenu(true)
	}

	if (status) {
		// status is defined

		return mobile ? (
			<div onClick={handleActionClick}>
				<PopUpMenu />
				<MdOutlineMoreVert />
			</div>
		) : (
			// not mobile device,
			<Button variant="outlined" style={{ width: "100px" }} onClick={handleActionClick}>
				<PopUpMenu />
				<MdArrowDropDown style={{ marginRight: "5px" }} />
				{status === SESSION.STARTED ? "Action" : "Paused"}
			</Button>
		)
	} else {
		// TODO: Check this
		const displayButton =
			startTime - now() < MIN_10 + 1000 // less than 10 mins, give a one second buffer as the ticks are not exactly accurate
				? appointmentType === "online" // online clinic
				: patient?.status === "confirmed" // consultation clinic
		// TODO ------------

		// * status undefined - not started
		return displayButton ? (
			<Button
				onClick={(e) => {
					e.stopPropagation()
					props.onClick("start")
				}}
			>
				Start Now
			</Button>
		) : null
	}
}

ActionButton.propTypes = {
	id: PropTypes.string,
	data: PropTypes.object,
	onClick: PropTypes.func,
}

export default ActionButton
