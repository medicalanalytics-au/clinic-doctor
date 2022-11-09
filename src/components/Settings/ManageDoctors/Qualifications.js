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

const Qualifications = (props) => {
	const { dispatch } = useContext(ProfileContext)

	const [qualificationsArray, setQualificationsArray] = useState([])
	const [newQualification, setNewQualifications] = useState("")

	useEffect(() => {
		setQualificationsArray(props.qualifications)
	}, [props.qualifications])

	const addQualifications = () => {
		const _qualifications = cloneDeep(qualificationsArray)
		_qualifications.push("")
		setQualificationsArray(_qualifications)
		setNewQualifications("")
	}

	const handleRemoveQualification = (index) => {
		addDialog(dispatch, {
			dialog: GenericDialog("Remove qualification " + qualificationsArray[index] + "?"),
			onConfirm: () => {
				const _qualifications = cloneDeep(qualificationsArray)
				_qualifications.splice(index, 1)
				setQualificationsArray(_qualifications)
				props.onEditQualifications(_qualifications)
			},
		})
	}

	return (
		<div style={styles.mainContainer}>
			<div style={styles.body}>
				<div style={styles.header}>QUALIFICATIONS</div>
				<div style={{ overflow: "scroll", height: "350px" }}>
					<TableContainer>
						<Table>
							<TableBody>
								{qualificationsArray.map((i, index) => {
									return (
										<TableRow key={i} hover>
											{i === "" ? (
												<EditableCell
													onChange={(e) => setNewQualifications(e.target.value)}
													onEdited={() => {
														if (newQualification === "") {
															const _qualifications = cloneDeep(qualificationsArray)
															_qualifications.length = _qualifications.length - 1
															setQualificationsArray(_qualifications)
														} else {
															const _qualifications = cloneDeep(qualificationsArray)
															_qualifications[_qualifications.length - 1] = newQualification
															setQualificationsArray(_qualifications)
															props.onEditQualifications(_qualifications)
														}
													}}
												/>
											) : (
												<DeleteableCell label={i} onDelete={() => handleRemoveQualification(index)} />
											)}
										</TableRow>
									)
								})}
							</TableBody>
						</Table>
					</TableContainer>
				</div>
			</div>
			<Button onClick={addQualifications}>Add Qualifications</Button>
		</div>
	)
}

Qualifications.propTypes = {
	qualifications: PropTypes.array,
	onEditQualifications: PropTypes.func,
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
export default Qualifications
