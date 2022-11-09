import { useContext, useEffect, useState } from "react"
import "../../../App.css"
import { cloneDeep, set } from "lodash"

// context
import { ProfileContext } from "../../../App"

// material ui
import { Button, Checkbox, FormControlLabel, FormGroup, MenuItem, Table, TableBody, TableCell, TableContainer, TableRow } from "@mui/material"

// constants
import { center, blankDoctorProfile, MAINCOLOR, redborder, blueborder } from "../../../utils/constants"

// network
import { doctor_getDoctors, doctor_saveDoctor } from "../../../utils/network"

import { showSnack } from "../../../utils/context"

// Swal
import { addDialog } from "../../../utils/context"
import { GenericDialog, SelectionDialog } from "../../../utils/sweetalertDialogs"

// custom functions
import { mobile, portrait, showError, useResponsiveMedia } from "../../../utils/helpers"

// custom components
import CustomTextField from "./CustomTextField"
import ProfilePicture from "./ProfilePicture"
import Qualifications from "./Qualifications"
import Specialisation from "./Specialisation"
import Languages from "./Languages"

const ManageDoctors = () => {
	const { state, dispatch } = useContext(ProfileContext)

	const media = useResponsiveMedia()

	const titles = ["Dr", "Mr", "Ms", "Mrs"]

	const [doctors, setDoctors] = useState(null)
	const [selectedDoctorUnmodified, setSelectedDoctorUnmodified] = useState(blankDoctorProfile)
	const [activeDoctor, setActiveDoctor] = useState(blankDoctorProfile)
	const [showInactiveRecords, setShowInactiveRecords] = useState(false)

	const PROFILEPIC = 0
	const QUALIFICATIONS = 1
	const SPECIALISATION = 2
	const LANGUAGES = 3

	const updateDoctorList = () => {
		return new Promise((resolve, reject) => {
			doctor_getDoctors(dispatch)
				.then((res) => {
					setDoctors(res)
					resolve()
				})
				.catch((error) => reject(error))
		})
	}

	const views = [
		<ProfilePicture
			picture={activeDoctor.profilePic}
			onProfilePictureChanged={async (picture) => {
				updateField("profilePic", picture)
				try {
					await updateDoctorList()
				} catch (error) {
					showError(dispatch, error)
				}
			}}
		/>,

		<Qualifications
			qualifications={activeDoctor.qualifications}
			onEditQualifications={(qualifications) => updateField("qualifications", qualifications)}
		/>,
		<Specialisation
			specialisations={activeDoctor.specialisations}
			onEditSpecialisation={(specialisations) => updateField("specialisations", specialisations)}
		/>,
		<Languages languages={activeDoctor.languages} onEditLanguages={(languages) => updateField("languages", languages)} />,
	]

	const [panelView, setPanelView] = useState(PROFILEPIC)

	useEffect(() => {
		doctor_getDoctors(dispatch)
			.then((res) => setDoctors(res))
			.catch((error) => showError(dispatch, error))
	}, [dispatch])

	useEffect(() => {
		if (selectedDoctorUnmodified !== blankDoctorProfile) {
			setPanelView(PROFILEPIC)
		}
	}, [selectedDoctorUnmodified])

	const selectDoctor = (doctor) => {
		const {
			_id,
			title,
			profileName,
			fullname,
			email,
			dateOfBirth,
			sex,
			languages,
			practice,
			profilePic,
			qualifications,
			specialisations,
			active,
			verified,
		} = doctor

		const newData = {
			_id,
			title,
			profileName,
			fullname,
			email,
			dateOfBirth:
				dateOfBirth.indexOf("-") > -1
					? dateOfBirth
					: dateOfBirth === ""
					? ""
					: [dateOfBirth.substring(0, 2), dateOfBirth.substring(2, 4), dateOfBirth.substring(4)].reverse().join("-"),
			sex,
			languages,
			practice,
			profilePic,
			qualifications,
			specialisations,
			active,
			verified,
		}

		setSelectedDoctorUnmodified(newData)
		setActiveDoctor(newData)
	}

	const updateField = (field, value) => {
		const newState = set(cloneDeep(activeDoctor), field, value)
		setActiveDoctor(newState)
	}

	const objectEquals = (obj1, obj2) => JSON.stringify(obj1) === JSON.stringify(obj2)

	const dataUnmodified = objectEquals(selectedDoctorUnmodified, activeDoctor)

	const saveDoctor = (doctor) => {
		return new Promise((resolve, reject) => {
			const _doctor = cloneDeep(doctor)
			const { dateOfBirth } = doctor
			set(_doctor, "dateOfBirth", dateOfBirth.split("-").reverse().join("")) // server dob format = ddMMyyyy

			doctor_saveDoctor(dispatch, _doctor)
				.then(async (id) => {
					try {
						id && set(doctor, "_id", id) // if an id is returned by server, set it to the data obj
						showSnack(dispatch, "Saved")
						setActiveDoctor(doctor)
						setSelectedDoctorUnmodified(doctor)
						try {
							await updateDoctorList()
							resolve()
						} catch (error) {
							reject(error)
						}
					} catch (error) {
						showError(dispatch, error)
					}
				})
				.catch((error) => reject(error))
		})
	}

	const addDoctor = () => {
		selectDoctor({ ...blankDoctorProfile, _id: 0 })
	}

	const cancelChanges = () => {
		addDialog(dispatch, {
			dialog: GenericDialog("Discard changes?"),
			onConfirm: () => setActiveDoctor(selectedDoctorUnmodified),
		})
	}

	const saveChanges = () => {
		addDialog(dispatch, {
			dialog: GenericDialog("Save changes?"),
			onConfirm: async () => {
				try {
					await saveDoctor(activeDoctor)
				} catch (error) {
					showError(dispatch, error)
				}
			},
		})
	}

	const styles = {
		...subStyles,
		mainContainer: {
			...supportStyles.mainContainer,
			flexDirection: mobile(media) ? "column-reverse" : "row",
		},
		noDoctorSelectedBox: {
			...supportStyles.noDoctorSelectedBox,
			flex: mobile(media) ? 1 : 2,
			marginRight: mobile(media) ? "5px" : "10px",
			marginLeft: mobile(media) ? "5px" : "0px",
		},
		doctorDetails: {
			...supportStyles.doctorDetails,
			height: mobile(media) ? "80%" : "100%", ///
			flexDirection: portrait(media) ? "column-reverse" : "row",
		},
		rightPanel: {
			...supportStyles.rightPanel,
			height: portrait(media) ? "30%" : "100%",
			flex: portrait(media) ? 0 : 1, // this will override height
			...redborder	
			// height: portrait(media) ? "10%" : "100%",
		},
	}

	return (
		<div style={styles.mainContainer}>
			{mobile(media) ? (
				<Button variant="contained" size="small" style={{ margin: "10px" }}>
					Select Doctor
				</Button>
			) : (
				<div style={styles.leftPanel}>
					<div style={styles.leftPanelUnscrollableInnerContainer}>
						<FormGroup style={{ marginLeft: "5px" }}>
							<FormControlLabel
								control={<Checkbox checked={showInactiveRecords} size="small" onChange={() => setShowInactiveRecords(!showInactiveRecords)} />}
								label="Show inactive records"
							/>
						</FormGroup>

						<div style={styles.doctorListBox}>
							<TableContainer>
								<Table>
									<TableBody>
										{doctors &&
											doctors
												.filter((i) => (showInactiveRecords ? i : i.active && i))
												.sort((a, b) => (a._id < b._id ? -1 : 1)) // sort by _id
												.map((i, index) => (
													<TableRow
														hover
														key={i._id}
														style={{ cursor: "pointer" }}
														onClick={() => {
															if (dataUnmodified) {
																selectDoctor(i)
															} else
																addDialog(dispatch, {
																	dialog: SelectionDialog("Data had been modified", "Save changes?", "Yes", "No"),
																	onConfirm: () => {
																		saveDoctor(activeDoctor)
																			.then(() => selectDoctor(i))
																			.catch((error) => showError(dispatch, error))
																	},
																	onDeny: () => selectDoctor(i),
																})
															/* doctor_getDoctorAppointment(dispatch, i._id)
													.then((res) => setAppointments(res))
													.catch((error) => showError(dispatch, error)) */
														}}
													>
														<TableCell style={{ fontWeight: activeDoctor._id === i._id ? "bold" : "normal" }}>
															{i.title} {i.fullname}
														</TableCell>
													</TableRow>
												))}
									</TableBody>
								</Table>
							</TableContainer>
						</div>
					</div>

					<div style={{ ...center }}>
						<Button style={styles.addDoctorButton} onClick={addDoctor} variant="outlined">
							Add Doctor
						</Button>
					</div>
				</div>
			)}

			{objectEquals(selectedDoctorUnmodified, blankDoctorProfile) ? (
				<div style={styles.noDoctorSelectedBox}>{doctors ? "No Doctor Selected" : "Loading..."}</div>
			) : (
				<div style={styles.doctorDetails}>
					<div style={styles.centerPanel}>
						<div style={styles.centerPanelBody}>
							<div style={styles.titleContainer}>
								<CustomTextField label="title" value={activeDoctor.title} width="20%" select onChange={(e) => updateField("title", e)}>
									{titles.map((i) => {
										return (
											<MenuItem value={i} key={i}>
												{i}
											</MenuItem>
										)
									})}
								</CustomTextField>

								<CustomTextField label="profile name" width="78%" value={activeDoctor.profileName} onChange={(e) => updateField("profileName", e)} />
							</div>

							<CustomTextField label="full name" value={activeDoctor.fullname} onChange={(e) => updateField("fullname", e)} />

							<CustomTextField label="email" value={activeDoctor.email} onChange={(e) => updateField("email", e)} />

							<div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
								<CustomTextField
									label="date of birth"
									value={activeDoctor.dateOfBirth}
									type="date"
									width="48%"
									onChange={(e) => updateField("dateOfBirth", e)}
								/>
								<CustomTextField label="sex" value={activeDoctor.sex} select width="48%" onChange={(e) => updateField("sex", e)}>
									<MenuItem value="m">Male</MenuItem>
									<MenuItem value="f">Female</MenuItem>
								</CustomTextField>
							</div>

							<Button onClick={() => setPanelView(PROFILEPIC)}>Profile Picture</Button>
							<Button onClick={() => setPanelView(QUALIFICATIONS)}>Qualifications</Button>
							<Button onClick={() => setPanelView(SPECIALISATION)}>Specialisation</Button>
							<Button onClick={() => setPanelView(LANGUAGES)}>Languages</Button>
							<div style={styles.setActiveContainer}>
								<FormGroup>
									<FormControlLabel
										control={
											<Checkbox
												disabled={activeDoctor._id === state._id}
												checked={activeDoctor.active}
												onChange={() => {
													if (activeDoctor.active) {
														addDialog(dispatch, {
															dialog: GenericDialog("This will disable login for " + activeDoctor.title + ". " + activeDoctor.fullname, "Warning!"),
															onConfirm: () => updateField("active", false),
														})
													} else {
														addDialog(dispatch, {
															dialog: GenericDialog("Enable login for " + activeDoctor.title + ". " + activeDoctor.fullname + "?"),
															onConfirm: () => updateField("active", true),
														})
													}
												}}
											/>
										}
										label="Active"
									/>
								</FormGroup>
							</div>
						</div>
						<div style={styles.buttonsContainer}>
							<Button disabled={dataUnmodified} variant="outlined" style={{ width: "45%", marginRight: "5px" }} onClick={cancelChanges}>
								Cancel
							</Button>
							<Button disabled={dataUnmodified} variant="contained" style={{ width: "45%", marginLeft: "5px" }} onClick={saveChanges}>
								Save Changes
							</Button>
						</div>
					</div>
					<div style={styles.rightPanel}>
						<div style={{ margin: "10px", height: "100%", width: "100%", ...center }}>{views[panelView]}</div>
					</div>
				</div>
			)}
		</div>
	)
}

const supportStyles = {
	mainContainer: {
		display: "flex",
		color: MAINCOLOR, ///
		height: "100%",
	},
	noDoctorSelectedBox: {
		...center,
		height: "100%", ///
		boxShadow: "0px 0px 5px " + MAINCOLOR,
		borderRadius: "5px",
		fontWeight: "bold",
	},
	doctorDetails: {
		display: "flex",
		flex: 2,
	},
	rightPanel: {
		...center,
	},
}

const subStyles = {
	leftPanel: {
		height: "100%",
		marginLeft: "10px",
		marginRight: "10px",
		width: "30%",
		border: "1px solid silver",
		borderRadius: "5px",
		flex: 1,
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
	},
	leftPanelUnscrollableInnerContainer: {
		height: "400px",
		overflow: "hidden", ///
	},
	centerPanel: {
		height: "100%",
		flex: 1,
		border: "1px solid silver", ///
		borderRadius: "5px",
		boxShadow: "0px 0px 5px " + MAINCOLOR,
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
	},
	centerPanelBody: {
		margin: "10px",
		display: "flex",
		flexDirection: "column", ///
	},
	titleContainer: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between", ///
	},
	doctorListBox: {
		height: "100%",
		overflow: "scroll",
	},
	addDoctorButton: {
		marginTop: "10px",
		width: "200px", ///
		marginBottom: "10px",
	},
	setActiveContainer: {
		...center,
		flexDirection: "row",
		marginTop: "5px",
	},
	buttonsContainer: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "center",
		marginBottom: "10px",
		width: "100%", ///
	},
}

export default ManageDoctors
