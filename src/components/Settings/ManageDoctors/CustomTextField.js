import "../../../App.css"
import PropTypes from "prop-types"

import { TextField } from "@mui/material"

const CustomTextField = (props) => {
	let _InputProps = props.InputProps && { ...props.InputProps }

	return (
		<TextField
			label={props.label}
			InputLabelProps={{ shrink: true }}
			style={{ width: props.width || "100%", marginBottom: "10px" }}
			size="small"
			value={props.value}
			type={props.type ? props.type : "text"}
			onChange={(e) => props.onChange(e.target.value)}
			color="primary"
			error={props.error}
			select={props.select}
			InputProps={_InputProps}
		>
			{props.select && props.children}
		</TextField>
	)
}

CustomTextField.propTypes = {
	label: PropTypes.string,
	type: PropTypes.string,
	width: PropTypes.string,
	value: PropTypes.string,
	error: PropTypes.bool,
	select: PropTypes.bool,
	InputProps: PropTypes.object,
	onChange: PropTypes.func,
}

export default CustomTextField
