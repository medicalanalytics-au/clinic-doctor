/**
 * Dashboard -> Appointments -> ModifyAppointment
 * Modify end time for online clinic
 */

import { useContext, useEffect, useState } from "react"
import "../../App.css"
import PropTypes from "prop-types"
import { DateTime } from "luxon"

// material ui
import { Button, Modal, TextField } from "@mui/material"
import { LocalizationProvider } from "@mui/x-date-pickers"
import DateAdapter from "@mui/lab/AdapterLuxon"
import { MobileTimePicker } from "@mui/x-date-pickers"
import Stack from "@mui/material/Stack"

// custom component
import Header from "../Common/Header"

// custom functions
import { getStringifiedDuration, now } from "../../utils/helpers"

// constants
import { HOUR_24, MIN_15 } from "../../utils/constants"

// Swal
import { GenericAlert } from "../../utils/sweetalertDialogs"
import { addDialog } from "../../utils/context"

// context
import { ProfileContext } from "../../App"

const ModifyAppointment = (props) => {
	const [newEndTime, setNewEndTime] = useState(props?.data?.endTime) // state is used to ensure that the initial date and the minimum date is sync

	const value = useContext(ProfileContext)
	const { dispatch } = value

	useEffect(() => {
		props.open && setNewEndTime(props.data?.endTime)
	}, [props.open, props.data])

	const handleEndTimeChange = (e) => {
		let newDate = DateTime.fromMillis(now()).set({ hour: e.hour, minute: e.minute, second: 0, millisecond: 0 }).toMillis()
		const _newEndTime = newDate < props?.data.startTime + MIN_15 ? newDate + HOUR_24 : newDate
		setNewEndTime(_newEndTime)
	}

	const saveChanges = () => {
		const diff = newEndTime - props?.data?.endTime
		diff < 0
			? addDialog(dispatch, {
					dialog: GenericAlert(getStringifiedDuration(newEndTime, props.data.endTime) + " had been removed"),
			  })
			: addDialog(dispatch, {
					dialog: GenericAlert(getStringifiedDuration(props.data.endTime, newEndTime) + " had been added"),
			  })

		props.onExtend(newEndTime)
		props.close()
	}
	// TODO: Change to <ModalScreen/>
	return (
		<Modal open={props.open}>
			<div style={styles.overlay}>
				<div className="ModalScreen">
					<Header title="Extend Online Clinic Session" close={() => props.close()} />

					<div style={styles.timePickersContainer}>
						<LocalizationProvider dateAdapter={DateAdapter}>
							<Stack spacing={3}>
								<MobileTimePicker
									label="Current End Time"
									disabled
									value={DateTime.fromMillis(props?.data?.endTime || 0)}
									onChange={() => {}} // this props is required
									renderInput={(params) => <TextField {...params} />}
								/>

								<MobileTimePicker
									label="Select New End Time"
									value={DateTime.fromMillis(newEndTime || now())}
									onChange={handleEndTimeChange}
									renderInput={(params) => <TextField {...params} />}
								/>
							</Stack>
						</LocalizationProvider>
						<div style={styles.duration}>
							<div style={styles.durationLabel}>Duration</div>
							<div>{getStringifiedDuration(props?.data?.startTime, newEndTime)}</div>
						</div>
					</div>
					<div style={styles.saveButtonContainer}>
						<Button disabled={newEndTime === props?.data?.endTime} onClick={saveChanges}>
							Save
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	)
}

ModifyAppointment.propTypes = {
	open: PropTypes.bool,
	close: PropTypes.func,
	data: PropTypes.object,
	onExtend: PropTypes.func,
}

const styles = {
	overlay: {
		height: "100%",
		width: "100%",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
	header: {
		padding: "20px",
		display: "flex",
		justifyContent: "center",
		fontWeight: "bold",
		borderBottom: "1px solid silver",
		boxShadow: "0px 0px 8px 1px silver",
	},
	timePickersContainer: {
		height: "100%",
		padding: "10px",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		flexDirection: "column", 
	},
	duration: {
		marginTop: "20px",
		display: "flex",
		flexDirection: "row", 
	},
	durationLabel: {
		fontWeight: "bold",
		marginRight: "20px", 
	},
	saveButtonContainer: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "center",
		marginRight: "10px",
		marginBottom: "50px", 
	},
}
export default ModifyAppointment
