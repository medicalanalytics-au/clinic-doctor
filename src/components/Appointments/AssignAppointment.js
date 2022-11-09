/**
 * Dashboard -> Appointments -> AssignAppointment
 * For administrating doctor to assign missed appointments to other doctors/self
 */

import React, { useContext, useEffect, useState } from "react"
import "../../App.css"
import PropTypes from "prop-types"
import { DateTime } from "luxon"

// material ui
import { Button, Radio, RadioGroup, Table, TableBody, TableCell, TableRow } from "@mui/material"

// constants
import { center, MAINCOLOR, WHITE } from "../../utils/constants"

// network
import { doctor_acceptMissedAppointment, doctor_assignMissedAppointment, doctor_getDoctorAppointment, doctor_getDoctors } from "../../utils/network"

// custom functions
import { formatDate, generateTimeList, mobilePortrait, now, showError, useResponsiveMedia } from "../../utils/helpers"
import { loadActiveAppointments } from "../../utils/sockets"

// context
import { ProfileContext } from "../../App"

// Swal
import { addDialog } from "../../utils/context"
import { GenericDialog, GenericError, TimePicker } from "../../utils/sweetalertDialogs"

const AssignAppointment = (props) => {
	const { state, dispatch } = useContext(ProfileContext)

	const [doctors, setDoctors] = useState([])
	const [selected, setSelected] = useState("")
	const [appointments, setAppointments] = useState([])

	const media = useResponsiveMedia()
	const isMobilePortrait = mobilePortrait(media)

	useEffect(() => {
		doctor_getDoctors(dispatch)
			.then((res) => setDoctors(res))
			.catch((error) => showError(dispatch, error))
	}, [dispatch])

	const assignDoctor = (doctor_id) => {
		const invalidAppointment = () => {
			addDialog(dispatch, {
				dialog: GenericError("No doctor selected"),
			})
		}

		const acceptAppointment = async () => {
			const menuOptions = generateTimeList()

			addDialog(dispatch, {
				dialog: TimePicker("Accept this appointment?", "Confirm", menuOptions),
				onConfirm: (value) => {
					if (value < now())
						addDialog(dispatch, {
							dialog: GenericError("Invalid time selected"),
						})
					else
						addDialog(dispatch, {
							dialog: GenericDialog(formatDate(parseInt(value, DateTime.TIME_SIMPLE)), "Accept this timing?"),
							onConfirm: () => {
								doctor_acceptMissedAppointment(dispatch, {
									doctor_id,
									appointment_id: props.appointment_id,
									startTime: value,
								})
									.then(() => loadActiveAppointments(dispatch, state._id))
									.catch((error) => showError(dispatch, error))
								props.close()
							},
						})
				},
			})
		}

		const assignAppointment = () => {
			const pos = doctors.findIndex((i) => i._id === selected)
			if (pos > -1) {
				const text = "Assign this appointment to " + doctors[pos].title + ". " + doctors[pos].fullname

				addDialog(dispatch, {
					dialog: GenericDialog(text),
					onConfirm: () => {
						doctor_assignMissedAppointment(dispatch, {
							doctor_id: selected,
							appointment_id: props.appointment_id,
						})
							.then(() => loadActiveAppointments(dispatch, state._id))
							.catch((error) => showError(dispatch, error))
						props.close()
					},
				})
			}
		}

		switch (true) {
			case selected === "":
				invalidAppointment()
				break
			case selected === state._id:
				acceptAppointment()
				break
			default:
				assignAppointment()
				break
		}
	}

	const styles = {
		...subStyles,
		doctorList: {
			...supportStyles.doctorList,
			width: isMobilePortrait ? "100%" : "45%",
		},
	}

	return (
		<div style={styles.mainContainer}>
			<div style={styles.body}>
				<div style={styles.doctorList}>
					<RadioGroup>
						<Table>
							<TableBody>
								{doctors.map((i) => (
									<TableRow
										key={i._id}
										style={{ cursor: "pointer" }}
										onClick={() => {
											setSelected(i._id)
											doctor_getDoctorAppointment(dispatch, i._id)
												.then((res) => setAppointments(res))
												.catch((error) => showError(dispatch, error))
										}}
									>
										<TableCell padding="none">
											<Radio checked={selected === i._id} />
										</TableCell>
										<TableCell>
											{i.title} {i.fullname}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</RadioGroup>
				</div>
				{!isMobilePortrait && (
					<div style={styles.appointmentContainer}>
						{appointments.length === 0 ? (
							<div style={styles.noAppointments}>No upcoming appointments</div>
						) : (
							<div>
								<div style={styles.appointmentListTitle}>UPCOMING APPOINTMENTS</div>
								<Table>
									<TableBody>
										{appointments.map((i) => (
											<TableRow key={i.startTime + i.endTime}>
												<TableCell>
													<div style={styles.appointmentsCell}>
														<div style={styles.bold}>{i.appointmentType === "online" ? "Online Clinic" : "Consultation"}</div>
														<div style={styles.bold}>{formatDate(i.startTime, DateTime.DATE_SHORT)}</div>
														<div style={styles.timeRow}>
															<div style={styles.timeLabel}>Start</div>
															<div style={styles.timeStr}>{formatDate(i.startTime, DateTime.TIME_24_SIMPLE)}</div>
															<div style={styles.timeLabel}>End</div>
															<div style={styles.timeStr}>{formatDate(i.endTime, DateTime.TIME_24_SIMPLE)}</div>
														</div>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						)}
					</div>
				)}
			</div>
			<div style={styles.buttonContainer}>
				<Button variant="contained" style={styles.button} onClick={() => assignDoctor(selected)}>
					Assign
				</Button>
			</div>
		</div>
	)
}

AssignAppointment.propTypes = {
	appointment_id: PropTypes.string,
	close: PropTypes.func,
}

const supportStyles = {
	doctorList: {
		height: "90%",
		border: "1px solid silver",
		marginRight: "5px",
		borderRadius: "5px",
		boxShadow: "0px 0px 3px silver",
		padding: "3px",
		overflowY: "scroll",
	},
}

const subStyles = {
	mainContainer: {
		height: "100%",
		display: "flex",
		flexDirection: "column",
		padding: "20px",
		justifyContent: "space-between",
	},
	body: {
		height: "90%",
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
	},
	appointmentContainer: {
		width: "55%",
		border: "1px solid silver",
		height: "90%",
		overflowY: "scroll",
		boxShadow: "0px 1px 3px silver",
	},
	noAppointments: {
		...center,
		height: "90%",
	},
	appointmentListTitle: {
		fontWeight: "bold",
		backgroundColor: MAINCOLOR,
		color: WHITE,
		padding: "10px",
	},
	appointmentsCell: {
		display: "flex",
		flexDirection: "column",
	},
	bold: {
		fontWeight: "bold",
	},
	timeRow: {
		display: "flex",
		flexDirection: "row",
	},
	timeLabel: {
		fontWeight: "bold",
		marginRight: "5px",
	},
	timeStr: {
		marginRight: "10px",
	},
	buttonContainer: {
		width: "100%",
		...center,
	},
	button: {
		width: "100px",
		marginTop: "5px",
		marginBottom: "10px",
	},
}
export default AssignAppointment
