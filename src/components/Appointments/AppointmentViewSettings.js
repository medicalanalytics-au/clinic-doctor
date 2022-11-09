/**
 * Dashboard -> Appointments -> AppointmentViewSettings
 * Settings for view options for Appointments
 */

import { useState } from "react"
import "../../App.css"
import PropTypes from "prop-types"

// material ui
import { Button, Checkbox, FormGroup, FormControlLabel } from "@mui/material"

import { BLACK, center } from "../../utils/constants"

// custom components
import SelectionOptions from "./SelectionOptions"

const AppointmentViewSettings = (props) => {
	const [cancel, setCancel] = useState(props?.settings?.showCancelledAppointments)
	const [expired, setExpired] = useState(props?.settings?.showExpiredAppointments)
	const [appointmentView, setAppointmentView] = useState(props?.settings?.appointmentView)
	const [monthView, setMonthView] = useState(props?.settings?.monthView)
	const [yearView, setYearView] = useState(props?.settings?.yearView)

	const setShowCancelledOption = (e) => setCancel(e.target.checked)
	const setShowExpiredOption = (e) => setExpired(e.target.checked)

	const saveSettings = () => {
		props.onSaveSettings({
			showCancelledAppointments: cancel,
			showExpiredAppointments: expired,
			appointmentView,
			monthView,
			yearView,
		})
		props.close()
	}

	return (
		<div style={styles.mainContainer}>
			<div style={styles.body}>
				<FormGroup>
					<FormControlLabel
						style={{ color: BLACK }}
						control={<Checkbox checked={cancel} onChange={setShowCancelledOption} />}
						label="Show cancelled appointments"
					/>
					<FormControlLabel
						style={{ marginBottom: "10px", color: BLACK }}
						control={<Checkbox checked={expired} onChange={setShowExpiredOption} />}
						label="Show expired appointments"
					/>
				</FormGroup>
				{props.mobile && (
					<SelectionOptions
						mobile={props.mobile}
						appointmentView={appointmentView}
						monthView={monthView}
						yearView={yearView}
						appointmentViewChange={(res) => setAppointmentView(res)}
						monthViewChange={(res) => setMonthView(res)}
						yearViewChange={(res) => setYearView(res)}
					/>
				)}
			</div>
			<div style={styles.buttonContainer}>
				<Button variant="contained" onClick={saveSettings}>
					Save Settings
				</Button>
			</div>
		</div>
	)
}

AppointmentViewSettings.propTypes = {
	close: PropTypes.func,
	mobile: PropTypes.bool,
	settings: PropTypes.object,
	onSaveSettings: PropTypes.func,
}

const styles = {
	mainContainer: {
		height: "100%",
		display: "flex",
		flexDirection: "column",
		padding: "20px",
		justifyContent: "space-between", ///
	},
	body: {
		height: "100%",
		display: "flex",
		flexDirection: "column", ///
	},
	buttonContainer: center,
}
export default AppointmentViewSettings
