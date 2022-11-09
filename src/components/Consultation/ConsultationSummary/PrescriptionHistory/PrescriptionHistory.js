import React, { useContext, useState } from "react"
import "../../../../App.css"
import PropTypes from "prop-types"

// react icons
import { BsSortDown, BsSortUp } from "react-icons/bs"
import { FaPrescriptionBottleAlt, FaPrescription } from "react-icons/fa"

// material ui
import { Table, TableBody, TableContainer } from "@mui/material"

// context
import { ProfileContext } from "../../../../App"

// custom components
import ModalScreen from "../../../Common/ModalScreen"
import SpeedButton from "../../../Common/SpeedButton"
import AddPrescription from "./AddPrescription"
import PrescriptionRow from "./PrescriptionRow"

// constant
import { blankPrescription, center } from "../../../../utils/constants"

const PrescriptionHistory = (props) => {
	const [descending, setDescending] = useState(true)
	const [prescriptionOpen, setPrescriptionOpen] = useState(false)

	const [prescriptionData, setPrescriptionData] = useState(blankPrescription)

	const { state } = useContext(ProfileContext)
	const { patient, patient_appointment_id } = state.consultation
	const { history } = patient

	const styles = {
		...subStyles,
		mainContainer: {
			...supportStyles.mainContainer,
			fontSize: props.mobile ? "10px" : "15px",
		},
	}

	return (
		<div style={styles.mainContainer}>
			<div style={styles.innerContainer}>
				<ModalScreen
					icon={<FaPrescription style={styles.modalIcon} />}
					open={prescriptionOpen}
					close={() => setPrescriptionOpen(false)}
					content={<AddPrescription data={prescriptionData} close={() => setPrescriptionOpen(false)} />}
					title={"Prescription"}
				/>

				<div style={styles.toolbar}>
					<SpeedButton
						onClick={() => {
							setPrescriptionData(blankPrescription)
							setPrescriptionOpen(true)
						}}
						icon={<FaPrescriptionBottleAlt />}
					/>

					<SpeedButton onClick={() => setDescending((descending) => !descending)} icon={descending ? <BsSortUp /> : <BsSortDown />} />
				</div>

				{history.filter((i) => i._id === patient_appointment_id).findIndex((i) => i.prescriptions.length > 0) > -1 ? (
					<div style={styles.table}>
						<TableContainer style={{ width: "100%" }}>
							<Table padding="none">
								<TableBody>
									{history
										.filter((i) => i._id === patient_appointment_id)
										.sort((a, b) => (descending ? a.datetime - b.datetime : b.datetime - a.datetime))
										.map((i) => (
											<PrescriptionRow
												key={i._id}
												data={i}
												onEditMedication={(data) => {
													setPrescriptionData(data)
													setPrescriptionOpen(true)
												}}
											/>
										))}
								</TableBody>
							</Table>
						</TableContainer>
					</div>
				) : (
					<div style={styles.noPrescriptions}>No prescriptions found</div>
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
	modalIcon: {
		fontSize: "30px",
		marginLeft: "10px",
		color: "silver",
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
	noPrescriptions: {
		height: "100%",
		...center,
		border: "1px solid silver",
		borderRadius: "5px",
	},
}

PrescriptionHistory.propTypes = {
	notes: PropTypes.array,
}

export default PrescriptionHistory
