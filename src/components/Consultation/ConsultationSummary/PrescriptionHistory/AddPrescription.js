import React, { useContext, useState } from "react"
import "../../../../App.css"
import PropTypes from "prop-types"

// material ui
import { Button, Checkbox, FormControlLabel, FormGroup } from "@mui/material"

// custom components
import InputField from "./InputField"

// Swal
import { addDialog } from "../../../../utils/context"
import { GenericDialog, GenericError } from "../../../../utils/sweetalertDialogs"

// context
import { ProfileContext } from "../../../../App"

// network
import { doctor_removeMedicationFromPrescription, doctor_savePrescription } from "../../../../utils/network"

// custom functions
import { updatePatientHistory } from "../../../../utils/helpers"

const AddPrescription = (props) => {
	const { state, dispatch } = useContext(ProfileContext)
	const { patient_appointment_id, patient } = state.consultation
	const { patient_id } = patient

	const [medication, setMedication] = useState(props.data.medication)
	const [substitutionAllowed, setSubstitutionAllowed] = useState(props.data.substitutionAllowed)
	const [sig, setSig] = useState(props.data.sig)
	const [strength, setStrength] = useState(props.data.strength)
	const [quantity, setQuantity] = useState(props.data.quantity)
	const [refill, setRefill] = useState(props.data.refill)

	const { _id } = props.data

	const showError = (error) => {
		const msg = error === "medication" ? "Please enter a valid medication name" : "Please enter a valid quantity"
		addDialog(dispatch, {
			dialog: GenericError(msg),
		})
	}

	const handleRemove = () => {
		addDialog(dispatch, {
			dialog: GenericDialog("Remove " + props.data.medication + " " + props.data.strength + "?"),
			onConfirm: async () => {
				doctor_removeMedicationFromPrescription(dispatch, patient_appointment_id, _id)
					.then(() => {
						updatePatientHistory(patient_id, dispatch)
						props.close()
					})
					.catch((error) => showError(dispatch, error))
			},
		})
	}

	const handleClick = () => {
		const prescriptionChanged = () => {
			return (
				medication.trim() !== props.data.medication.trim() ||
				substitutionAllowed !== props.data.substitutionAllowed ||
				sig.trim() !== props.data.sig.trim() ||
				strength !== props.data.strength ||
				quantity !== props.data.quantity ||
				refill !== props.data.refill
			)
		}

		const save = async () => {
			doctor_savePrescription(dispatch, {
				patient_appointment_id,
				medication_id: _id,
				prescription: {
					medication: medication.trim(),
					substitutionAllowed,
					sig: sig.trim(),
					strength,
					quantity,
					refill,
				},
			})
				.then(() => {
					updatePatientHistory(patient_id, dispatch)
					props.close()
				})
				.catch((error) => showError(dispatch, error))
		}

		if (medication.length < 4) showError("medication")
		else if (quantity < 1) showError("quantity")
		else {
			if (_id) {
				if (prescriptionChanged()) {
					addDialog(dispatch, {
						dialog: GenericDialog("Save changes?"),
						onConfirm: () => save(),
					})
				} else props.close()
			} else save()
		}
	}

	return (
		<div style={styles.mainContainer}>
			<div style={styles.inputContainer}>
				<InputField label="Medication" autoFocus value={medication} onChange={(e) => setMedication(e.target.value)} />

				<FormGroup>
					<FormControlLabel
						style={{ color: "black" }}
						control={<Checkbox defaultChecked={props.data.substitutionAllowed} onChange={() => setSubstitutionAllowed(!substitutionAllowed)} />}
						label="Substitution Allowed"
					/>
				</FormGroup>

				<InputField label="Sig" multiline value={sig} onChange={(e) => setSig(e.target.value)} />
				<InputField label="Strength" small value={strength} onChange={(e) => setStrength(e.target.value)} />
				<InputField label="Quantity" small number value={quantity} onChange={(e) => setQuantity(e.target.value)} />
				<InputField label="Refill" small number value={refill} onChange={(e) => setRefill(e.target.value)} />
			</div>

			<div style={styles.buttonContainer}>
				{_id && (
					<Button style={{ marginRight: "10px" }} onClick={handleRemove}>
						Remove
					</Button>
				)}
				<Button style={{ marginRight: "10px" }} variant="contained" onClick={handleClick}>
					{_id ? "Save" : "Add Medication"}
				</Button>
			</div>
		</div>
	)
}

AddPrescription.propTypes = {
	data: PropTypes.object,
	close: PropTypes.func,
}

const styles = {
	mainContainer: {
		display: "flex",
		flexDirection: "column",
		width: "100%",
		justifyContent: "space-between",
		height: "100%",
	},
	inputContainer: {
		margin: "10px",
		display: "flex",
		flexDirection: "column",
	},
	buttonContainer: {
		display: "flex",
		width: "100%",
		flexDirection: "row",
		justifyContent: "flex-end",
	},
}
export default AddPrescription
