/**
 * Dashboard -> Appointments
 * Main Appointments page.
 */

import { useContext, useEffect, useState } from "react"
import "../../App.css"
import { DateTime } from "luxon"

// react icons
import { FaRegEdit } from "react-icons/fa"
import { MdTune } from "react-icons/md"
import { IoOptionsOutline } from "react-icons/io5"
import { VscUnlock } from "react-icons/vsc"

// icons
import settings from "../../images/settings.png"
import assign from "../../images/assign.png"
import details from "../../images/details.png"

// Swal
import { GenericDialog, GenericError, TimePicker } from "../../utils/sweetalertDialogs"
import { addDialog, setSessionPaused, setVideoScreenStatus } from "../../utils/context"

// network calls
import {
	doctor_acceptMissedAppointment,
	doctor_changeAppointmentStatus,
	doctor_modifySessionEndTime,
	doctor_startAppointmentNow,
} from "../../utils/network"

// material ui
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, ThemeProvider } from "@mui/material"

// custom functions
import {
	formatDate,
	THEME,
	today,
	current,
	now,
	loadAppointments,
	HeaderTableCell,
	useResponsiveMedia,
	mobile,
	showError,
	generateTimeList,
} from "../../utils/helpers"

// constants
import { SESSION, APPOINTMENT_TYPE, REQUESTSTATUS, RED, BLACK, GRAY } from "../../utils/constants"

// custom components
import AppointmentDetails from "./AppointmentDetails"
// import AddAppointment from "./AddAppointment"
import ModalScreen from "../Common/ModalScreen"
import Timer from "./Timer"
import StatusButton from "./StatusButton"
import SelectionOptions from "./SelectionOptions"
import AppointmentViewSettings from "./AppointmentViewSettings"
import ActionButton from "./ActionButton"
import ModifyAppointment from "./ModifyAppointment"
import AssignAppointment from "./AssignAppointment"

// context
import { ProfileContext } from "../../App"
import { setSessionReady, setSelectedMonth, setSelectedYear, setShowDoctorsNotes } from "../../utils/context"
import { loadActiveAppointments } from "../../utils/sockets"

export const modifySessionStatus = (status, appointment_id, state, dispatch) => {
	const { _id, selectedMonth, selectedYear } = state

	if (status === SESSION.PAUSED) {
		doctor_changeAppointmentStatus(dispatch, appointment_id, "paused")
			.then(() => loadAppointments(_id, selectedMonth, selectedYear, dispatch))
			.catch((error) => showError(dispatch, error))
	} else if (status === SESSION.RESUME) {
		setVideoScreenStatus(dispatch, "Waiting for response from patient")
		setSessionPaused(dispatch, false)

		doctor_changeAppointmentStatus(dispatch, appointment_id, "started")
			.then(() => loadAppointments(_id, selectedMonth, selectedYear, dispatch))
			.catch((error) => showError(dispatch, error))
	} else if (status === "stop") {
		doctor_modifySessionEndTime(dispatch, appointment_id, now(), "Ending session", true)
			.then(() => loadAppointments(_id, selectedMonth, selectedYear, dispatch))
			.catch((error) => showError(dispatch, error))
	}
}

const Appointments = (props) => {
	const { state, dispatch } = useContext(ProfileContext)
	const { appointments, selectedMonth, selectedYear, _id } = state

	const [showDetails, setShowDetails] = useState(false)
	const [id, setId] = useState()

	const [extendAppointmentOpen, setExtendAppointmentOpen] = useState(false)
	const [showAssignScreen, setShowAssignScreen] = useState(false)

	const [appointmentData, setAppointmentData] = useState()

	const [showCancelledAppointments, setShowCancelledAppointments] = useState(true)
	const [showExpiredAppointments, setShowExpiredAppointments] = useState(true)

	// * drop down menu values
	const [appointmentView, setAppointmentView] = useState("all")

	const [modalOpen, setModalOpen] = useState(false)
	const [modalContent, setModalContent] = useState()
	const [modalTitle, setModalTitle] = useState()

	const [appointmentList, setAppointmentList] = useState([])

	const { DATE_SHORT, TIME_24_SIMPLE } = DateTime

	const media = useResponsiveMedia()
	const isMobile = mobile(media)

	useEffect(() => {
		// * ensure updated appointment status are used to display in table
		appointments && setAppointmentList(appointments)
	}, [appointments])

	useEffect(() => {
		if (selectedMonth !== "" && selectedYear !== "") loadAppointments(_id, selectedMonth, selectedYear, dispatch)
	}, [_id, selectedMonth, selectedYear, dispatch])

	const openSettings = () => {
		// TODO eliminate this function and place <AppointmentViewSettings/> directly into content
		const content = (
			<AppointmentViewSettings
				close={() => setModalOpen(false)}
				mobile={isMobile}
				settings={{
					showCancelledAppointments,
					showExpiredAppointments,
					appointmentView,
					monthView: selectedMonth,
					yearView: selectedYear,
				}}
				onSaveSettings={(res) => {
					setShowCancelledAppointments(res.showCancelledAppointments)
					setShowExpiredAppointments(res.showExpiredAppointments)
					setAppointmentView(res.appointmentView)
					setSelectedMonth(dispatch, res.monthView)
					setSelectedYear(dispatch, res.yearView)
				}}
			/>
		)
		setModalTitle("Settings")
		setModalContent(content)
		setModalOpen(true)
	}

	const cellStyle = {
		fontSize: "12px",
	}

	const cellHeaderStyle = {
		...cellStyle,
		width: "100px",
	}

	const cellHeaderCenteredStyle = {
		...cellHeaderStyle,
		textAlign: "center",
	}

	const startClinic = (id, doctor_id) => {
		// * Called from <ActionButton/>

		addDialog(dispatch, {
			dialog: GenericDialog("Start clinic now?"),
			onConfirm: () => {
				doctor_startAppointmentNow(dispatch, id, now()) // param now() is included to synchronise start time with server
					.then(() => loadAppointments(doctor_id, selectedMonth, selectedYear, dispatch))
					.catch((error) => showError(dispatch, error))
			},
		})
	}

	const stopClinic = (id) => {
		// * Called from <ActionButton/>

		addDialog(dispatch, {
			dialog: GenericDialog("End consultation?"),
			onConfirm: () => {
				// TODO End clinic here
				modifySessionStatus(SESSION.STOP, id, state, dispatch)
			},
		})
	}

	const MISSEDSTATUS = [REQUESTSTATUS.MISSED, REQUESTSTATUS.ASSIGNED]

	const missedConsultation = (consultationRecord) => MISSEDSTATUS.includes(consultationRecord.patient?.status)

	return (
		<ThemeProvider theme={THEME}>
			<div className="appointmentListContainer">
				<ModalScreen
					icon={details}
					open={showDetails}
					close={() => setShowDetails(false)}
					content={<AppointmentDetails appointment_id={id} close={() => setShowDetails(false)} onAssign={() => setShowAssignScreen(true)} />}
					title={"Appointment Details"}
				/>

				<ModalScreen
					icon={assign}
					open={showAssignScreen}
					close={() => setShowAssignScreen(false)}
					content={
						<AssignAppointment
							appointment_id={id}
							close={() => {
								setShowAssignScreen(false)
								setShowDetails(false)
							}}
						/>
					}
					title={"Assign appointment"}
				/>

				<ModifyAppointment
					open={extendAppointmentOpen}
					close={() => setExtendAppointmentOpen(false)}
					data={appointmentData}
					onExtend={(res) => {
						const { _id, doctor_id } = appointmentData
						// TODO Check "res" to see whether it conforms to doctor_modifySessionEndTime params
						doctor_modifySessionEndTime(dispatch, _id, "Extending session", res)
							.then(() => loadAppointments(doctor_id, selectedMonth, selectedYear, dispatch))
							.catch((error) => showError(dispatch, error))
					}}
				/>

				<ModalScreen
					icon={settings}
					open={modalOpen}
					close={() => setModalOpen(false)}
					// TODO instead of setting modalContent through a function, just add the AppointmentViewSettings component
					content={modalContent}
					title={modalTitle}
				/>

				{/*  // * Selection toolbox. Displayed only if not mobile */}
				<div style={{ width: "100%", marginBottom: "5px", display: isMobile ? "none" : "flex", flexDirection: "row" }}>
					<div style={{ marginRight: "15px", display: "flex", justifyContent: "center", alignItems: "center" }}>
						<IconButton size="small" onClick={() => openSettings()}>
							<MdTune />
						</IconButton>
					</div>
					<SelectionOptions
						mobile={isMobile}
						appointmentView={appointmentView}
						monthView={selectedMonth}
						yearView={selectedYear}
						monthViewChange={(res) => setSelectedMonth(dispatch, res)} // unclosed/active/month
						yearViewChange={(res) => setSelectedYear(dispatch, res)} // only for month views
						appointmentViewChange={(res) => setAppointmentView(res)} // today/all
					/>
				</div>

				<TableContainer className="appointmentListTable">
					<Table stickyHeader size="small">
						<TableHead>
							<TableRow>
								<HeaderTableCell style={cellHeaderStyle}>Date</HeaderTableCell>
								<HeaderTableCell style={{ ...cellHeaderStyle, width: "80px" }}>Time</HeaderTableCell>
								{!isMobile && <HeaderTableCell style={cellHeaderStyle}>End</HeaderTableCell>}
								<HeaderTableCell style={cellHeaderCenteredStyle}>Appointment</HeaderTableCell>

								{!isMobile && <HeaderTableCell style={cellHeaderStyle}>Status</HeaderTableCell>}
								<HeaderTableCell style={{ ...cellHeaderCenteredStyle, width: isMobile ? "50px" : "150px" }}>
									{isMobile ? (
										<IoOptionsOutline
											onClick={(e) => {
												e.stopPropagation()
												openSettings()
											}}
										/>
									) : (
										"Action"
									)}
								</HeaderTableCell>
								{!isMobile && <HeaderTableCell style={{ ...cellHeaderStyle, width: "200px" }}>Booking Date</HeaderTableCell>}
								<HeaderTableCell style={{ ...cellHeaderStyle, width: "50px" }}> </HeaderTableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{appointmentList
								.filter((i) => (appointmentView === "all" ? i : today(i.startTime)))
								.filter((i) =>
									showCancelledAppointments
										? showExpiredAppointments
											? i
											: current(i.endTime)
										: showExpiredAppointments
										? i.patient?.status !== "cancelled"
										: i.patient?.status !== "cancelled" && current(i.endTime)
								)

								.map((i, index) => {
									const color = missedConsultation(i) ? RED : current(i.endTime) ? BLACK : GRAY
									const cellContentStyle = {
										...cellStyle,
										color,
									}

									return (
										<TableRow
											key={i._id}
											hover
											onClick={() => {
												if (i.patient?.status === REQUESTSTATUS.ASSIGNED) {
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
																			doctor_id: state._id,
																			appointment_id: i._id,
																			startTime: value,
																		})
																			.then(() => loadActiveAppointments(dispatch, state._id))
																			.catch((error) => showError(dispatch, error))
																	},
																})
														},
													})
												} else {
													setId(i._id)
													setShowDetails(true)
												}
											}}
										>
											<TableCell style={cellContentStyle}>{formatDate(i.startTime, DATE_SHORT)}</TableCell>
											<TableCell style={cellContentStyle}>{formatDate(i.startTime, TIME_24_SIMPLE)}</TableCell>
											{!isMobile && <TableCell style={cellContentStyle}>{formatDate(i.endTime, TIME_24_SIMPLE)}</TableCell>}
											<TableCell>
												<div style={{ display: "flex", justifyContent: "center" }}>
													<StatusButton label={i.appointmentType} color={color} status={i.patient?.status} />
												</div>
											</TableCell>
											{!isMobile && (
												<TableCell style={cellContentStyle}>
													{MISSEDSTATUS.includes(i.patient?.status)
														? i.patient.status
														: i.patient?.status !== "cancelled" && <Timer data={i} inSessionLabel="Ending in" />}
													{/* {i.patient?.status === REQUESTSTATUS.MISSED
														? "missed"
														   ? i.patient?.status === REQUESTSTATUS.ASSIGNED
														      ? 'assigned'
														: i.patient?.status !== "cancelled" && <Timer data={i} inSessionLabel="Ending in" />} */}
												</TableCell>
											)}
											<TableCell style={cellContentStyle} align="center">
												{
													i.endTime > now() && index === 0 && !missedConsultation(i) && (
														<ActionButton
															id={i._id}
															data={i}
															onClick={(action) => {
																switch (action) {
																	case "start":
																		startClinic(i._id, i.doctor_id)
																		break
																	case "stop":
																		stopClinic(i._id)
																		break
																	case "extend":
																		setAppointmentData(i)
																		setExtendAppointmentOpen(true)
																		break
																	case "pause":
																		setSessionReady(dispatch, false)
																		modifySessionStatus(SESSION.PAUSED, i._id, state, dispatch)
																		break
																	case "resume":
																		// TODO : check for appointment type, and resume video only for consultation appointment
																		i.appointmentType === APPOINTMENT_TYPE.CONSULTATION && setSessionReady(dispatch, true)
																		modifySessionStatus(SESSION.RESUME, i._id, state, dispatch)
																		break
																	default:
																		setSessionReady(dispatch, false)
																		modifySessionStatus(SESSION.PAUSED, i._id, state, dispatch)
																		break
																}
															}}
														/>
													)
													// )
												}
											</TableCell>
											{!isMobile && <TableCell style={cellContentStyle}>{formatDate(i.bookingDate)}</TableCell>}

											<TableCell style={cellContentStyle}>
												<div style={{ display: "flex", flexDirection: "row" }}>
													<div>{i.notes && i.notes !== "" && <FaRegEdit style={{ marginRight: "5px" }} />}</div>
													{i.closed === false && !missedConsultation(i) && (
														<div>
															<VscUnlock
																onClick={(e) => {
																	e.stopPropagation()
																	setShowDoctorsNotes(dispatch, true)
																}}
															/>
														</div>
													)}
												</div>
											</TableCell>
										</TableRow>
									)
								})}
						</TableBody>
					</Table>
				</TableContainer>
			</div>
		</ThemeProvider>
	)
}

export default Appointments
