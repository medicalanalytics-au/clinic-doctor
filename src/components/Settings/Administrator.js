import { useContext, useState } from "react"
import "../../App.css"

// material ui
import { Button, InputAdornment, MenuItem, TextField } from "@mui/material"

// context
import { ProfileContext } from "../../App"

// Swal
import { addDialog, setGlobalSettings, showManageDoctorsScreen } from "../../utils/context"

import { MAINCOLOR } from "../../utils/constants"
import { GenericDialog } from "../../utils/sweetalertDialogs"
import { doctor_setGlobalSettings } from "../../utils/network"
import { showError } from "../../utils/helpers"

const Administrator = () => {
	const value = useContext(ProfileContext)
	const { state, dispatch } = value
	const { settings } = state

	const [consultationFees, setConsultationFees] = useState(settings.consultationFees)
	const [sessionExtensionFees, setSessionExtensionFees] = useState(settings.sessionExtensionFees)
	const [sessionStartMode, setSessionStartMode] = useState(settings.sessionStartMode)

	return (
		<div style={styles.mainContainer}>
			<div style={{ marginBottom: "20px" }}>
				<Button variant="outlined" onClick={() => showManageDoctorsScreen(dispatch)}>
					Manage Doctors
				</Button>
			</div>
			<TextField
				label={"Consultation fees"}
				value={consultationFees}
				onChange={(e) => setConsultationFees(e.target.value)}
				variant={"outlined"}
				type="number"
				autoComplete={"off"}
				size={"small"}
				style={styles.textfieldWidth}
				InputProps={{
					startAdornment: <InputAdornment position="start">$</InputAdornment>,
				}}
			/>

			<TextField
				label={"Session extension fees"}
				value={sessionExtensionFees}
				onChange={(e) => setSessionExtensionFees(e.target.value)}
				variant={"outlined"}
				type="number"
				autoComplete={"off"}
				size={"small"}
				style={styles.textfieldWidth}
				InputProps={{
					startAdornment: <InputAdornment position="start">$</InputAdornment>,
				}}
			/>

			<TextField
				label="Session start mode"
				size="small"
				select
				value={sessionStartMode}
				onChange={(e) => setSessionStartMode(e.target.value)}
				style={styles.textfieldWidth}
			>
				<MenuItem value="audio">Audio</MenuItem>
				<MenuItem value="video">Video</MenuItem>
			</TextField>

			<div style={{ display: "flex", flexDirection: "column" }}>
				<Button
					style={{ width: "150px" }}
					disabled={
						consultationFees === settings.consultationFees &&
						sessionExtensionFees === settings.sessionExtensionFees &&
						sessionStartMode === settings.sessionStartMode
					}
					onClick={() => {
						addDialog(dispatch, {
							dialog: GenericDialog("Save settings?"),
							onConfirm: () => {
								doctor_setGlobalSettings(dispatch, { consultationFees, sessionExtensionFees, sessionStartMode })
									.then(() =>
										setGlobalSettings(dispatch, {
											consultationFees,
											sessionExtensionFees,
											sessionStartMode,
										})
									)
									.catch((error) => showError(dispatch, error))
							},
						})
					}}
				>
					Save Settings
				</Button>
			</div>
		</div>
	)
}

const styles = {
	mainContainer: {
		display: "flex",
		flexDirection: "column",
		color: MAINCOLOR, 
	},
	textfieldWidth: {
		marginBottom: "10px",
		width: "300px", 
	},
}

export default Administrator
