import { useContext, useEffect, useState } from "react"
import "../../../App.css"
import PropTypes from "prop-types"
import { cloneDeep } from "lodash"

// context
import { ProfileContext } from "../../../App"

// constants
import { center, WHITE, MAINCOLOR_LIGHT } from "../../../utils/constants"

// material ui
import { Button, Table, TableBody, TableContainer, TableRow } from "@mui/material"

// Swal
import { addDialog } from "../../../utils/context"
import { GenericDialog } from "../../../utils/sweetalertDialogs"

// custom components
import DeleteableCell from "./DeleteableCell"
import EditableCell from "./EditableCell"

const Specialisation = (props) => {
	const { dispatch } = useContext(ProfileContext)

	const [specialisationArray, setSpecialisationArray] = useState([])
	const [newSpecialisation, settNewSpecialisation] = useState("")

	useEffect(() => {
		setSpecialisationArray(props.specialisations)
	}, [props.specialisations])

	const addSpecialisation = () => {
		const _specialisation = cloneDeep(specialisationArray)
		_specialisation.push("")
		setSpecialisationArray(_specialisation)
		settNewSpecialisation("")
	}

	const handleRemoveSpecialisation = (index) => {
		addDialog(dispatch, {
			dialog: GenericDialog("Remove specialisations " + specialisationArray[index] + "?"),
			onConfirm: () => {
				const _specialisation = cloneDeep(specialisationArray)
				_specialisation.splice(index, 1)
				setSpecialisationArray(_specialisation)
				props.onEditSpecialisation(_specialisation)
			},
		})
	}

	return (
		<div style={styles.mainContainer}>
			<div style={styles.body}>
				<div style={styles.header}>SPECIALISATION</div>
				<div style={{ overflow: "scroll", height: "350px" }}>
					<TableContainer>
						<Table>
							<TableBody>
								{specialisationArray.map((i, index) => {
									return (
										<TableRow key={i} hover>
											{i === "" ? (
												<EditableCell
													onChange={(e) => settNewSpecialisation(e.target.value)}
													onEdited={() => {
														if (newSpecialisation === "") {
															const _specialisation = cloneDeep(specialisationArray)
															_specialisation.length = _specialisation.length - 1
															setSpecialisationArray(_specialisation)
														} else {
															const _specialisation = cloneDeep(specialisationArray)
															_specialisation[_specialisation.length - 1] = newSpecialisation
															setSpecialisationArray(_specialisation)
															props.onEditSpecialisation(_specialisation)
														}
													}}
												/>
											) : (
												<DeleteableCell label={i} onDelete={() => handleRemoveSpecialisation(index)} />
											)}
										</TableRow>
									)
								})}
							</TableBody>
						</Table>
					</TableContainer>
				</div>
			</div>
			<Button onClick={addSpecialisation}>Add Specialisation</Button>
		</div>
	)
}

Specialisation.propTypes = {
	specialisations: PropTypes.array,
	onEditSpecialisation: PropTypes.func,
}

const styles = {
	mainContainer: {
		display: "flex",
		flexDirection: "column",
		height: "100%",
		width: "100%",
		alignItems: "center",
		justifyContent: "space-between",
	},
	body: {
		width: "100%",
		height: "400px",
		overflow: "hidden", ///
	},
	header: {
		padding: "10px",
		...center,
		fontWeight: "bold",
		color: WHITE,
		backgroundColor: MAINCOLOR_LIGHT, ///
	},
}
export default Specialisation
