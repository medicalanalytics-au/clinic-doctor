import React, { useContext, useEffect, useState } from "react"
import "../../App.css"
import { DateTime } from "luxon"

// icon
import user from "../../images/user.jpg"

// material ui
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material"

// context
import { ProfileContext } from "../../App"
import { loadPatients } from "../../utils/context"

// custom functions
import { doctor_getPatientsList } from "../../utils/network"
import { HeaderTableCell, showError, useResponsiveMedia } from "../../utils/helpers"

// constants
import { center, MEDIA } from "../../utils/constants"

// custom component
import DisplayContainer from "../Common/DisplayContainer"
import ModalScreen from "../Common/ModalScreen"
import SearchBar from "./SearchBar"
import PatientDetails from "./PatientDetails"

const Patients = () => {
	const { state, dispatch } = useContext(ProfileContext)
	const { _id, patients } = state

	const [patientId, setPatientId] = useState("")
	const [searchText, setSearchText] = useState("")
	const [list, setList] = useState(patients)

	const [modalOpen, setModalOpen] = useState(false)
	const [patientName, setPatientName] = useState("")

	useEffect(() => {
		setList(
			Object.values(
				patients.reduce((obj, i) => {
					const { patient_id, datetime } = i
					// * remove duplicated patient record by selecting only the latest consultation date
					obj[patient_id] ? obj[patient_id].datetime < datetime && (obj[patient_id] = i) : (obj[patient_id] = i)

					return obj
				}, {})
			).filter((i) => (searchText.length === 0 ? i : i.name.toUpperCase().includes(searchText.toUpperCase())))
		)
	}, [patients, searchText])

	useEffect(() => {
		doctor_getPatientsList(dispatch, _id)
			.then((patients) => loadPatients(dispatch, patients))
			.catch((error) => showError(dispatch, error))
	}, [_id, dispatch])

	const media = useResponsiveMedia()

	return (
		<DisplayContainer title="PATIENTS" extraComponent={<SearchBar onChange={(value) => setSearchText(value)} />}>
			<ModalScreen
				icon={user}
				open={modalOpen}
				close={() => setModalOpen(false)}
				content={<PatientDetails id={patientId} close={() => setModalOpen(false)} />}
				title={
					<div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
						<div>{patientName}</div>
						<div style={{ fontSize: "10px", display: "flex", flexDirection: "row", justifyContent: "flex-start" }}>
							<div style={{ marginRight: "10px" }}>Male</div>
							<div>49</div>
						</div>

						{console.log({ state })}
						{/* <IconButton
							size="small"
							onClick={() => {
								setMessageRecipient(dispatch, {
									id: patientId,
									name: patientName,
								})

								setMessageMode(dispatch, MODE.EDIT)

								const body = {
									datetime: null,
									practice: null,
									practice_address: null,
									subject: null,
									text: "",
									to: patientName,
									to_id: patientId,
								}

								const senderData = {
									datetime: null,
									from_id: state._id,
									to: patientName,
									to_id: patientId,
								}

								openMessage(dispatch, {
									body,
									senderData,
									// new: true,
								})
							}}
						>
							<AiOutlineMail />
						</IconButton> */}
					</div>
				}
			/>

			<div style={styles.innerContainer}>
				{list.length > 0 ? (
					<TableContainer
						style={{
							...styles.table,
							width: media.type === MEDIA.DESKTOP ? "70%" : "100%",
						}}
					>
						<Table stickyHeader>
							<TableHead>
								<TableRow>
									<HeaderTableCell>Name</HeaderTableCell>
									<HeaderTableCell>Last Appointment</HeaderTableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{list.map((i) => {
									return (
										<React.Fragment key={i._id}>
											<TableRow
												onClick={() => {
													setPatientId(i.patient_id)
													setPatientName(i.name)
													setModalOpen(true)
												}}
											>
												<TableCell>{i.name}</TableCell>
												<TableCell>{DateTime.fromMillis(i.datetime).toLocaleString(DateTime.DATETIME_SHORT)}</TableCell>
											</TableRow>
										</React.Fragment>
									)
								})}
							</TableBody>
						</Table>
					</TableContainer>
				) : (
					<div>No patients found</div>
				)}
			</div>
		</DisplayContainer>
	)
}

const styles = {
	innerContainer: {
		...center,
		width: "100%",
		height: "80%",
	},
	table: {
		height: "100%",
		overflow: "auto",
		boxShadow: "1px 1px 5px 2px silver",
		borderRadius: "5px",
		padding: "5px",
	},
}
export default Patients
