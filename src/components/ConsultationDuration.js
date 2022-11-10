/**
 * this component is used for selecting the End Time for the automatic "Start Clinic" option from main dashboard
 */

import { useCallback, useContext, useEffect, useRef, useState } from "react"
import "../App.css"
import PropTypes from "prop-types"
import { DateTime } from "luxon"

// material ui
import { Button, MenuItem, TextField } from "@mui/material"
import { LocalizationProvider, MobileTimePicker } from "@mui/x-date-pickers"
import DateAdapter from "@mui/lab/AdapterLuxon"

// context
import { ProfileContext } from "../App"

// Swal
import { addDialog } from "../utils/context"
import { GenericError } from "../utils/sweetalertDialogs"

// custom functions
import { formatDate, getDuration, now } from "../utils/helpers"

// constants
import { APPOINTMENT_TYPE, BLACK, HOUR_1, HOUR_12, MAINCOLOR, MIN_1, MIN_14, MIN_5, RED } from "../utils/constants"

const ConsultationDuration = (props) => {
	const { state, dispatch } = useContext(ProfileContext)
	const { appointments } = state

	const _nextAppt = useRef()
	const activeAppointments = useRef()

	const zero = useCallback((ms) => {
		return DateTime.fromMillis(ms).set({ seconds: 0, millisecond: 0 }).toMillis()
	}, [])

	const [endTime, setEndTime] = useState(zero(now() + HOUR_1))

	const [hour, setHour] = useState(1)
	const [minute, setMinute] = useState(0)

	useEffect(() => {
		// * if there is an appointment coming up, set max time to 5 mins before the start time of the next appointment

		activeAppointments.current = appointments.filter((i) => i.endTime >= now())

		_nextAppt.current = activeAppointments.current[0] || null

		let end = zero(now() + HOUR_1) // defaults to one hour from now

		if (_nextAppt.current) {
			// * if the next appointment is less than one hour from now
			if (_nextAppt.current.startTime - now() <= HOUR_1) {
				end = zero(_nextAppt.current.startTime - MIN_5)

				const { minutes } = getDuration(end - now())

				setHour(0)
				setMinute(Math.round(minutes))
			}
		}

		setEndTime(end)
	}, [zero, appointments])

	const handleTimeChange = (v) => {
		const value = zero(v.toMillis() - now())
		const { hours, minutes } = getDuration(value)

		setEndTime(
			zero(
				v
					.plus({ hours: hours < 0 || minutes < 0 ? (hours < -11 ? 24 : 12) : 0 })
					.minus({ hours: hours >= 24 ? 24 : 0 })
					.toMillis()
			)
		)
		setHour(hours)
		setMinute(minutes)
	}

	const calculateEndTimeFromDuration = (hr, min) => setEndTime(zero(now() + hr * HOUR_1 + min * MIN_1))

	const handleHourChange = (e) => {
		setHour(e.target.value)
		calculateEndTimeFromDuration(e.target.value, minute)
	}

	const handleMinuteChange = (e) => {
		setMinute(e.target.value)
		calculateEndTimeFromDuration(hour, e.target.value)
	}

	const collisionWithClinic = () => _nextAppt?.current?.appointmentType === APPOINTMENT_TYPE.ONLINE && endTime >= _nextAppt?.current?.startTime

	const getNextConsultation = () =>
		activeAppointments?.current?.findIndex((i) => i.appointmentType === APPOINTMENT_TYPE.CONSULTATION && i.startTime - MIN_5 < endTime)

	const collisionWithConsultation = () => getNextConsultation() > -1

	const InvalidSessionDuration = "Minimum session duration is 15 minutes"

	const duration = endTime - DateTime.now().toMillis()

	const disablingError = () => duration < MIN_14 || duration > HOUR_12 || collisionWithConsultation()

	return (
		<div style={styles.mainContainer}>
			<div className="timeboxContainer">
				<LocalizationProvider dateAdapter={DateAdapter}>
					<MobileTimePicker
						label="Select End Time"
						value={DateTime.fromMillis(endTime)}
						onChange={handleTimeChange}
						renderInput={(params) => <TextField {...params} value={endTime} variant="outlined" size="small" error={disablingError()} />}
					/>
				</LocalizationProvider>

				<div style={styles.calculatedEndTime}>{formatDate(endTime)}</div>
				<div style={styles.durationHeader}>Duration</div>
				<div style={styles.durationSelectBoxes}>
					<TextField
						onChange={handleHourChange}
						label={"hour" + (hour === 1 ? "" : "s")}
						value={hour}
						type="number"
						size="small"
						style={{ width: "100px", marginRight: "5px" }}
						select
					>
						{[...Array(13).keys()].map((i) => {
							return (
								<MenuItem value={i} key={i} disabled={(i === 0 && minute < 3) || (i === 12 && minute > 0)}>
									{i}
								</MenuItem>
							)
						})}
					</TextField>

					<TextField
						onChange={handleMinuteChange}
						label={"minute" + (minute === 1 ? "" : "s")}
						value={minute}
						type="number"
						size="small"
						style={{ width: "100px" }}
						select
					>
						{[...Array(60).keys()].map((i) => {
							return (
								<MenuItem
									value={i}
									key={i}
									disabled={(i < 3 && hour === 0) || (i > 0 && hour === 12)}
									style={{ display: i % 5 === 0 ? "auto" : "none" }}
								>
									{i}
								</MenuItem>
							)
						})}
					</TextField>
				</div>
				{endTime - DateTime.now().toMillis() < MIN_14 && <div style={styles.invalidSessionDuration}>{InvalidSessionDuration}</div>}

				{collisionWithClinic() && (
					<div style={styles.onlineClinicCollision}>
						{"You have an online clinic starting at " + DateTime.fromMillis(_nextAppt?.current?.startTime).toLocaleString(DateTime.TIME_24_SIMPLE)}
					</div>
				)}

				{collisionWithConsultation() && (
					<div style={styles.consultationClinicCollision}>
						{"You have a consultation clinic starting at " +
							DateTime.fromMillis(activeAppointments.current[getNextConsultation()].startTime).toLocaleString(DateTime.TIME_24_SIMPLE)}
					</div>
				)}
			</div>

			<div style={styles.buttonLine}>
				<Button style={styles.buttons} onClick={props.close}>
					Cancel
				</Button>
				<Button
					disabled={disablingError()}
					variant="contained"
					style={styles.buttons}
					onClick={() => {
						if (endTime - DateTime.now().toMillis() < MIN_14) {
							addDialog(dispatch, {
								dialog: GenericError(InvalidSessionDuration),
							})
						} else {
							props.onStartClinic(endTime)
							props.close()
						}
					}}
				>
					OK
				</Button>
			</div>
		</div>
	)
}

const styles = {
	mainContainer: {
		height: "100%",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		color: BLACK,
		justifyContent: "space-between",
	},
	calculatedEndTime: {
		marginTop: "10px",
		fontSize: "10px",
		color: MAINCOLOR,
		fontWeight: "bold",
	},
	durationHeader: {
		marginTop: "10px",
		marginLeft: "25px",
		marginBottom: "10px",
		color: "gray",
		fontSize: "12px",
		width: "210px",
		display: "flex",
		justifyContent: "flex-start",
	},
	durationSelectBoxes: {
		display: "flex",
		flexDirection: "row",
		alignItems: "flex-end",
		width: "100%",
		justifyContent: "center",
	},
	invalidSessionDuration: {
		marginTop: "10px",
		fontSize: "10px",
		color: RED,
		fontWeight: "bold",
	},
	onlineClinicCollision: {
		marginTop: "10px",
		fontSize: "10px",
		color: MAINCOLOR,
		fontWeight: "bold",
	},
	consultationClinicCollision: {
		marginTop: "10px",
		fontSize: "10px",
		color: RED,
		fontWeight: "bold",
	},
	buttonLine: {
		marginBottom: "10px",
		display: "flex",
		flexDirection: "row",
		justifyContent: "flex-end",
		width: "100%",
	},
	buttons: {
		marginRight: "10px",
		width: "100px",
	},
}

ConsultationDuration.propTypes = {
	onStartClinic: PropTypes.func,
	close: PropTypes.func,
}

export default ConsultationDuration
