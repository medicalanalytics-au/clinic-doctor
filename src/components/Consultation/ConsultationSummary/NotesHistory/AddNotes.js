import { useContext, useRef, useState } from "react"
import "../../../../App.css"
import PropTypes from "prop-types"

// material ui
import { Button, MenuItem, TextField } from "@mui/material"

// context
import { ProfileContext } from "../../../../App"

// Swal
import { addDialog } from "../../../../utils/context"
import { GenericDialog } from "../../../../utils/sweetalertDialogs"

// constant
import { center } from "../../../../utils/constants"
import { mobile, tablet, useResponsiveMedia } from "../../../../utils/helpers"

const AddNotes = (props) => {
	const { state, dispatch } = useContext(ProfileContext)

	const { consultation } = state
	const { patient_appointment_id } = consultation

	const [warningStatus, setWarningStatus] = useState(props.notes.status)
	const [text, setText] = useState(props.notes ? props.notes.text : "")

	const media = useResponsiveMedia()

	const textRef = useRef()

	const MODE = {
		DRAFT: "draft",
		SAVE: "save",
		isDraft: (mode) => mode === "draft",
		isSaved: (mode) => mode === "save",
	}
	const previouslySaved = () => props.notes.saved
	const previouslyDraft = () => props.notes.saved === false

	const textChanged = () => text !== props.notes.text

	const statusChanged = () => warningStatus !== props.notes.status

	const textEmpty = () => text.length === 0
	const modeChanged = (mode) => !((MODE.isSaved(mode) && previouslySaved()) || (MODE.isDraft(mode) && previouslyDraft()))

	const handleClick = async (mode) => {
		// * NOTE: props.onSaved(null) will close the dialog without saving anything

		const removeNote = {
			mode: "remove",
			patient_appointment_id,
			data: null,
		}

		const data = {
			mode,
			patient_appointment_id,
			warningStatus,
			text: text.trim(),
		}

		if (textChanged()) {
			if (textChanged() && textEmpty()) {
				addDialog(dispatch, {
					dialog: GenericDialog("Remove note?", "This action is irreversible"),
					onConfirm: () => props.onSaved(removeNote),
				})
			} else {
				// text changed and not empty
				if (MODE.isDraft(mode)) {
					if (previouslySaved()) {
						addDialog(dispatch, {
							dialog: GenericDialog("Unpublish note?"),
							onConfirm: () => props.onSaved(data), // save to draft
						})
					} else {
						// previously undefined or draft
						props.onSaved(data) // save to draft
					}
				} else {
					// text changed and mode = save
					props.onSaved(data) // save this note
				}
			}
		} else {
			// text unchanged
			if (textEmpty()) {
				props.onSaved(null) // close this
			} else {
				// text unchanged and not empty
				if (modeChanged(mode)) {
					if (MODE.isDraft(mode)) {
						if (previouslySaved()) {
							addDialog(dispatch, {
								dialog: GenericDialog("Unpublish note?"),
								onConfirm: () => props.onSaved(data), // save to draft
							})
						} else {
							// previously undefined or draft
							props.onSaved(data) // continue to save to draft
						}
					} else {
						// mode = save
						props.onSaved(data) // save this note
					}
				} else {
					// text unchanged and mode unchanged and not empty
					if (statusChanged()) props.onSaved(data) // continue to save to draft
					else props.onSaved(null) // close this
				}
			}
		}
	}

	return (
		<div style={styles.mainContainer}>
			<div style={styles.content}>
				<div>
					<TextField select size="small" value={warningStatus} onChange={(e) => setWarningStatus(e.target.value)}>
						<MenuItem value="Normal">Normal</MenuItem>
						<MenuItem value="Warning">Warning</MenuItem>
					</TextField>
				</div>
				<div onClick={() => textRef.current && textRef.current.focus()} style={styles.textFieldContainer}>
					<TextField
						inputRef={textRef}
						multiline
						fullWidth
						autoFocus
						maxRows={mobile(media) ? 15 : tablet(media) ? 30 : 8}
						variant="standard"
						InputProps={{
							disableUnderline: true,
						}}
						sx={{ input: { color: "red" } }}
						style={{ marginTop: "10px" }}
						value={text}
						onChange={(e) => setText(e.target.value)}
					/>
				</div>
				<div style={styles.documentStatus}>
					{textEmpty()
						? textChanged() // text empty
							? "Not saved" // empty and changed
							: "" // empty and unchanged
						: textChanged() // not empty
						? previouslyDraft() // not empty and changed
							? "Draft - modified"
							: previouslySaved()
							? "Saved - modified"
							: "Not saved"
						: previouslyDraft() // not empty and unchanged
						? "Draft"
						: statusChanged()
						? "Saved - modified"
						: "Saved"}
				</div>
			</div>
			<div style={styles.buttonContainer}>
				{text.length > 0 && <Button onClick={() => handleClick(MODE.DRAFT)}>Draft</Button>}
				<Button onClick={() => handleClick(MODE.SAVE)} variant="contained">
					{
						textEmpty()
							? textChanged()
								? "Remove note"
								: "Close" // text unchanged
							: "Save" // not empty
					}
				</Button>
			</div>
		</div>
	)
}

AddNotes.propTypes = {
	notes: PropTypes.object,
	onSaved: PropTypes.func,
}

const styles = {
	mainContainer: {
		display: "flex",
		flexDirection: "column",
		width: "100%",
		justifyContent: "space-between",
		height: "100%",
	},
	content: {
		display: "flex",
		flexDirection: "column",
		width: "100%",
		height: "100%",
	},
	documentStatus: {
		...center,
		margin: "10px",
		color: "black",
		fontSize: "12px",
		fontWeight: "bold",
	},
	buttonContainer: {
		height: "10%",
		display: "flex",
		flexDirection: "row",
		justifyContent: "flex-end",
		alignItems: "flex-end",
		margin: "10px",
	},
	textFieldContainer: {
		border: "1px solid silver",
		marginTop: "10px",
		borderRadius: "5px",
		height: "100%",
		overflow: "hidden",
		padding: "5px", 
	},
}

export default AddNotes
