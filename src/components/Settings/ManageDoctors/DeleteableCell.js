import { useState } from "react"
import "../../../App.css"
import PropTypes from "prop-types"

import { TableCell } from "@mui/material"
import { IoCloseOutline } from "react-icons/io5"

const DeleteableCell = (props) => {
	const [showDelete, setShowDelete] = useState(false)

	return (
		<TableCell onMouseEnter={() => setShowDelete(true)} onMouseLeave={() => setShowDelete(false)}>
			<div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
				<div>{props.label}</div>
				<div style={{ cursor: "pointer" }} onClick={props.onDelete}>
					{showDelete && <IoCloseOutline />}
				</div>
			</div>
		</TableCell>
	)
}

DeleteableCell.propTypes = {
	label: PropTypes.string,
	onDelete: PropTypes.func,
}

export default DeleteableCell
