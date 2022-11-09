import React, { useContext, useState } from "react"
import "../../../../App.css"
import PropTypes from "prop-types"
import { DateTime } from "luxon"

// react icons
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md"
import { RiFileEditLine } from "react-icons/ri"
import { FiTrash } from "react-icons/fi"

// material ui
import { Collapse, IconButton, TableCell, TableRow } from "@mui/material"

// custom function
import { showError, updatePatientHistory } from "../../../../utils/helpers"

// constant
import { center } from "../../../../utils/constants"

// Swal
import { addDialog } from "../../../../utils/context"
import { GenericDialog } from "../../../../utils/sweetalertDialogs"

// network
import { doctor_deletePrescription } from "../../../../utils/network"
import { ProfileContext } from "../../../../App"

const PrescriptionRow = (props) => {
	const { state, dispatch } = useContext(ProfileContext)
	const { patient_appointment_id, patient } = state.consultation
	const { patient_id } = patient

	const { data } = props

	const [collapsed, setCollapsed] = useState(false)

	return (
		<React.Fragment key={data._id}>
			<TableRow style={{ border: "1px solid ghostwhite" }} onClick={() => setCollapsed(!collapsed)}>
				<TableCell>
					<div style={styles.row}>
						<div style={styles.summaryRow}>
							<div style={styles.summaryHeader}>
								<div style={styles.summaryDatetime}>{DateTime.fromMillis(data.datetime).toLocaleString(DateTime.DATETIME_SHORT)}</div>
								<div>{data.doctor_name}</div>
							</div>
							<div style={styles.summaryPrescriptionRow}>
								<div style={styles.summaryPrescription}>
									{!collapsed &&
										data.prescriptions.map((j, index) => {
											return (
												<div key={j._id} style={styles.summaryPrescriptionMedication}>
													{index > 0 && <div style={{ marginRight: "5px" }}>{","}</div>}
													<div>{j.medication}</div>
												</div>
											)
										})}
								</div>
							</div>
						</div>
						<div style={{ height: "100%" }}>
							<IconButton>{collapsed ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}</IconButton>
						</div>
					</div>
				</TableCell>
			</TableRow>
			<TableRow>
				<TableCell>
					<Collapse in={collapsed} timeout="auto" unmountOnExit>
						<div style={styles.collapsedContainer}>
							{data.prescriptions.map((j) => {
								return (
									<div key={j._id} style={styles.collapsedIndividualMedicationRow}>
										<div style={{ display: "flex", flexDirection: "row" }}>
											{patient_appointment_id === data._id && (
												<div style={styles.editContainer}>
													<IconButton size="small" onClick={() => props.onEditMedication(j)}>
														<RiFileEditLine style={{ fontSize: "12px" }} />
													</IconButton>
												</div>
											)}
											<div style={styles.collapsedIndividualMedication}>
												<div style={styles.medicationName}>
													<div style={{ fontWeight: "bold", marginRight: "5px" }}>{j.medication}</div>
													<div style={{ fontWeight: "bold" }}>{j.strength}</div>
												</div>
												{j.substitutionAllowed && <div>Substitution Allowed</div>}
												{j.quantity > 0 && <div>Quantity: {j.quantity}</div>}
												{j.refill > 0 && <div>Refill: {j.refill}</div>}
												{j.sig && <div>{j.sig}</div>}
											</div>
										</div>
									</div>
								)
							})}
							{patient_appointment_id === data._id && (
								<div style={{ ...center, marginRight: "20px" }}>
									<IconButton
										size="small"
										onClick={() => {
											addDialog(dispatch, {
												dialog: GenericDialog("Remove entire prescription?"),
												onConfirm: () => {
													doctor_deletePrescription(dispatch, patient_appointment_id)
														.then(() => updatePatientHistory(patient_id, dispatch))
														.catch((error) => showError(dispatch, error))
												},
											})
										}}
									>
										<FiTrash />
									</IconButton>
								</div>
							)}
						</div>
					</Collapse>
				</TableCell>
			</TableRow>
		</React.Fragment>
	)
}

PrescriptionRow.propTypes = {
	data: PropTypes.object,
	onEditMedication: PropTypes.func,
}

const styles = {
	row: {
		display: "flex",
		flexDirection: "row",
		marginTop: "10px",
		padding: "5px",
	},
	summaryRow: {
		display: "flex",
		flexDirection: "column",
		width: "100%",
		fontSize: "12px",
	},
	summaryHeader: {
		display: "flex",
		flexDirection: "row",
	},
	summaryDatetime: {
		fontWeight: "bold",
		marginRight: "10px",
	},
	summaryPrescriptionRow: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
	},
	summaryPrescription: {
		display: "flex",
		flexDirection: "row",
		textOverflow: "ellipsis",
	},
	summaryPrescriptionMedication: {
		display: "flex",
		flexDirection: "row",
	},
	collapsedContainer: {
		display: "flex",
		flexDirection: "column",
		backgroundColor: "ghostwhite",
		padding: "5px",
		boxShadow: "2px 2px 5px 2px silver",
	},
	collapsedIndividualMedicationRow: {
		display: "flex",
		flexDirection: "column",
		fontSize: "12px",
		marginTop: "10px",
		marginBottom: "10px",
		width: "100%",
	},
	collapsedIndividualMedication: {
		display: "flex",
		flexDirection: "column",
		fontSize: "12px",
	},
	medicationName: {
		display: "flex",
		flexDirection: "row",
	},
	editContainer: {
		marginLeft: "20px",
		marginRight: "20px",
		cursor: "pointer",
		height: "100%", ///
	},
}

export default PrescriptionRow
