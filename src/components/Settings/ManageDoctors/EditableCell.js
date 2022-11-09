import { useRef } from "react"
import "../../../App.css"
import PropTypes from "prop-types"

import { TableCell, TextField } from "@mui/material"

const EditableCell = (props) => {
	const textfieldRef = useRef()

	return (
		<TableCell>
			<TextField
				inputRef={textfieldRef}
				size="small"
				autoFocus
				style={{ width: "100%" }}
				onChange={props.onChange}
				onKeyUp={(e) => e.key === "Enter" && textfieldRef.current.blur()}
				onBlur={props.onEdited}
			/>
		</TableCell>
	)
}

EditableCell.propTypes = {
	onChange: PropTypes.func,
	onEdited: PropTypes.func,
}

export default EditableCell
