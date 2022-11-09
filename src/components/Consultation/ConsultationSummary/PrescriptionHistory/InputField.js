import React from "react"
import "../../../../App.css"
import PropTypes from "prop-types"

// material ui
import { TextField } from "@mui/material"

const InputField = (props) => {
	const width = props.small ? { width: "100px" } : {}
	const style = {
		marginBottom: "10px",
		...width,
	}

	return (
		<TextField
			size="small"
			autoComplete="off"
			style={style}
			label={props.label}
			multiline={props.multiline ? true : false}
			autoFocus={props.autoFocus ? true : false}
			rows={props.multiline ? 3 : 1}
			value={props.value}
			type={props.number ? "number" : "string"}
			onChange={props.onChange}
		/>
	)
}

InputField.propTypes = {
	label: PropTypes.string,
	multiline: PropTypes.bool,
	autoFocus: PropTypes.bool,
	small: PropTypes.bool,
	number: PropTypes.bool,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	onChange: PropTypes.func,
}

export default InputField
