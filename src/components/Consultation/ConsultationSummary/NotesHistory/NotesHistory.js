import React, { useContext, useState } from "react"
import PropTypes from "prop-types"
import "../../../../App.css"

// react icons
import { BsSortDown, BsSortUp } from "react-icons/bs"
import { MdNoteAdd } from "react-icons/md"

// icons
import fileicon from "../../../../images/file.png"

// material ui
import { Collapse, Table, TableBody, TableCell, TableContainer, TableRow, TextField, useMediaQuery } from "@mui/material"
import { useTheme } from "@emotion/react"

// constants
import { center, RED, AMBER } from "../../../../utils/constants"

// context
import { ProfileContext } from "../../../../App"

// custom functions
import { doctor_saveNotes } from "../../../../utils/network"

// custom components
import ModalScreen from "../../../Common/ModalScreen"
import NotesContent from "./NotesContent"
import NoteItem from "./NoteItem"
import SpeedButton from "../../../Common/SpeedButton"

// custom functions
import { updatePatientHistory } from "../../../../utils/helpers"

const NotesRow = (props) => {
	const [collapsed, setCollapsed] = useState(false)

	const styles = {
		...subStyles,
	}
	return (
		<React.Fragment>
			<TableRow style={styles.notesrow.main}>
				<TableCell>
					<NoteItem
						item={props.data}
						collapsed={collapsed}
						onCollapseChange={() => setCollapsed(!collapsed)}
						onClick={() => {
							setCollapsed(!collapsed)
						}}
					/>
				</TableCell>
			</TableRow>

			<TableRow>
				<TableCell>
					<Collapse in={collapsed} timeout="auto" unmountOnExit>
						<div style={styles.notesrow.collapsedRow}>
							<div style={styles.notesrow.selectedOption}>
								<div>{props.data.notes.status === "Warning" && <div style={styles.notesrow.warning}>WARNING</div>}</div>
								<div>{!props.data.notes.saved && <div style={styles.notesrow.draft}>Draft</div>}</div>
							</div>
							<div style={styles.notesrow.clinicDetails}>
								<div style={{ fontWeight: "bold" }}>{props.data.clinic_name}</div>
								<div>{props.data.clinic_address}</div>
							</div>
							<TextField
								multiline
								value={props.data.notes.text}
								variant="standard"
								InputProps={{
									disableUnderline: true,
								}}
								inputProps={{ style: { fontSize: "13px" } }} // font size of input text
							/>
						</div>
					</Collapse>
				</TableCell>
			</TableRow>
		</React.Fragment>
	)
}

NotesRow.propTypes = {
	data: PropTypes.object,
}

const NotesHistory = () => {
	const [descending, setDescending] = useState(true)
	const [notesContentOpen, setNotesContentOpen] = useState(false)
	const [notes, setNotes] = useState(null)

	const value = useContext(ProfileContext)
	const { state, dispatch } = value
	const { consultation } = state
	const { patient_appointment_id, patient } = consultation
	const { patient_id, history } = patient

	const theme = useTheme()
	const mobile = useMediaQuery(theme.breakpoints.down("sm"))

	const styles = {
		...subStyles,
		mainContainer: {
			...supportStyles.mainContainer,
			fontSize: mobile ? "10px" : "15px",
		},
	}

	return (
		<div style={styles.mainContainer}>
			<div style={styles.innerContainer}>
				<ModalScreen
					open={notesContentOpen}
					close={() => setNotesContentOpen(false)}
					icon={fileicon}
					content={
						<NotesContent
							notes={notes}
							appointment_id={patient_appointment_id}
							close={() => setNotesContentOpen(false)}
							onSaved={async (note) => {
								if (note) {
									await doctor_saveNotes(dispatch, note)
									updatePatientHistory(patient_id, dispatch)
								}
								setNotesContentOpen(false)
							}}
						/>
					}
					title={"Notes"}
				/>

				<div style={styles.toolbar}>
					<SpeedButton
						onClick={() => {
							// get consultation history of the current appointment
							const pos = history.findIndex((i) => i._id === patient_appointment_id)
							// if notes is available, pass the notes + _id as data
							// if unavailable, create a new blank data object
							const data = {
								status: "Normal",
								text: "",
								_id: patient_appointment_id,
								...history[pos]?.notes,
							}

							setNotes(data)
							setNotesContentOpen(true)
						}}
						icon={<MdNoteAdd />}
					/>

					<SpeedButton onClick={() => setDescending((descending) => !descending)} icon={descending ? <BsSortUp /> : <BsSortDown />} />
				</div>
				{history.findIndex((i) => i.notes) > -1 ? (
					<div style={styles.table}>
						<TableContainer>
							<Table padding="none">
								<TableBody>
									{history
										.filter((i) => i.notes)
										.sort((a, b) => (descending ? a.datetime - b.datetime : b.datetime - a.datetime))
										.map((i) => {
											return <NotesRow key={i.datetime} data={i} />
										})}
								</TableBody>
							</Table>
						</TableContainer>
					</div>
				) : (
					<div style={styles.emptyNote}>No notes found</div>
				)}
			</div>
		</div>
	)
}

const supportStyles = {
	mainContainer: {
		height: "95%",
	},
}

const subStyles = {
	innerContainer: {
		height: "100%",
	},
	toolbar: {
		display: "flex",
		flexDirection: "row",
		marginBottom: "10px",
		marginRight: "10px",
		justifyContent: "space-between",
	},
	table: {
		height: "100%",
		overflow: "auto",
	},
	emptyNote: {
		height: "100%",
		...center,
		border: "1px solid silver",
		borderRadius: "5px",
	},
	notesrow: {
		main: {
			border: "1px solid ghostwhite",
		},
		collapsedRow: {
			display: "flex",
			flexDirection: "column",
			backgroundColor: "ghostwhite",
			boxShadow: "1px 1px 5px 2px silver",
			padding: "5px",
		},
		selectedOption: {
			display: "flex",
			flexDirection: "row",
		},
		draft: {
			marginLeft: "5px",
			fontStyle: "italic",
			color: AMBER,
			fontWeight: "bold",
		},
		warning: {
			color: RED,
			fontWeight: "bold",
		},
		clinicDetails: {
			display: "flex",
			flexDirection: "column",
			fontSize: "10px",
		},
	},
}

export default NotesHistory
