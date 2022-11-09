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

const Languages = (props) => {
	const { dispatch } = useContext(ProfileContext)

	const [languagesArray, setLanguagesArray] = useState([])
	const [newLanguage, setNewLanguage] = useState("")

	useEffect(() => {
		setLanguagesArray(props.languages)
	}, [props.languages])

	const addLanguage = () => {
		const _languages = cloneDeep(languagesArray)
		_languages.push("")
		setLanguagesArray(_languages)
		setNewLanguage("")
	}

	const handleRemoveLanguage = (index) => {
		addDialog(dispatch, {
			dialog: GenericDialog("Remove languages " + languagesArray[index] + "?"),
			onConfirm: () => {
				const _languages = cloneDeep(languagesArray)
				_languages.splice(index, 1)
				setLanguagesArray(_languages)
				props.onEditLanguages(_languages)
			},
		})
	}

	return (
		<div style={styles.mainContainer}>
			<div style={styles.body}>
				<div style={styles.header}>LANGUAGES</div>
				<div style={{ overflow: "scroll", height: "350px" }}>
					<TableContainer>
						<Table>
							<TableBody>
								{languagesArray.map((i, index) => {
									return (
										<TableRow key={i} hover>
											{i === "" ? (
												<EditableCell
													onChange={(e) => setNewLanguage(e.target.value)}
													onEdited={() => {
														if (newLanguage === "") {
															const _languages = cloneDeep(languagesArray)
															_languages.length = _languages.length - 1
															setLanguagesArray(_languages)
														} else {
															const _languages = cloneDeep(languagesArray)
															_languages[_languages.length - 1] = newLanguage
															setLanguagesArray(_languages)
															props.onEditLanguages(_languages)
														}
													}}
												/>
											) : (
												<DeleteableCell label={i} onDelete={() => handleRemoveLanguage(index)} />
											)}
										</TableRow>
									)
								})}
							</TableBody>
						</Table>
					</TableContainer>
				</div>
			</div>
			<Button onClick={addLanguage}>Add Languages</Button>
		</div>
	)
}

Languages.propTypes = {
	languages: PropTypes.array,
	onEditLanguages: PropTypes.func,
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
export default Languages
