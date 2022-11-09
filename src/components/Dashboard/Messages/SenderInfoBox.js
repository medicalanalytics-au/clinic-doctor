import { useContext, useEffect, useState } from "react"
import "../../../App.css"
import PropTypes from "prop-types"

// material ui
import { Button, Menu, MenuItem } from "@mui/material"

// network
import { doctor_getPatientsList } from "../../../utils/network"
import { ProfileContext } from "../../../App"
import { setMessageRecipient } from "../../../utils/context"
import { showError } from "../../../utils/helpers"

const SenderInfoBox = (props) => {
	const { state, dispatch } = useContext(ProfileContext)
	const { _id, message } = state
	const { senderData, recipient } = message

	/* const { data } = props
	const { from, from_id, to, to_id, from_practice, from_practice_address, to_practice, to_practice_address, datetime } = data */
	const { from, from_id, to, to_id, from_practice, from_practice_address, to_practice, to_practice_address, datetime } = senderData

	const [recipientList, setRecipientList] = useState([])
	const [anchorElement, setAnchorElement] = useState(null)
	const menuopen = Boolean(anchorElement)

	const handleMenuClick = (select) => {
		select.id && setMessageRecipient(dispatch, select)
		setAnchorElement(null)
	}

	useEffect(() => {
		doctor_getPatientsList(dispatch, _id)
			.then((res) => {
				// remove duplicate objects
				const list = [...new Map(res.map((i) => [i.patient_id, i.name]))].reduce((arr, current) => {
					arr.push({
						id: current[0],
						name: current[1],
					})
					return arr
				}, [])
				list.unshift({
					id: "ADMIN",
					name: "Admin",
				})
				setRecipientList(list)
			})
			.catch((error) => showError(dispatch, error))
	}, [_id, dispatch])

	return !datetime ? ( // draft
		<div>
			<Button style={styles.messageSender} onClick={(e) => setAnchorElement(e.currentTarget)}>
				{recipient?.name ? recipient.name : "Select Recipient"}
			</Button>

			<Menu open={menuopen} onClose={handleMenuClick} anchorEl={anchorElement}>
				{recipientList.map((i) => {
					return (
						<MenuItem key={i.id} onClick={() => handleMenuClick(i)} value={i}>
							{i.name}
						</MenuItem>
					)
				})}
			</Menu>
		</div>
	) : (
		<div>
			<div style={styles.messageSender}>{to_id !== _id ? to : from}</div>
			{from_id === _id ? (
				to_practice && (
					<div>
						<div style={{ fontSize: "12px" }}>{to_practice}</div>
						<div style={{ fontSize: "12px" }}>{to_practice_address}</div>
					</div>
				)
			) : (
				<div>
					<div style={{ fontSize: "12px" }}>{from_practice}</div>
					<div style={{ fontSize: "12px" }}>{from_practice_address}</div>
				</div>
			)}
		</div>
	)
}

SenderInfoBox.propTypes = {
	id: PropTypes.string,
	data: PropTypes.object,
}

const styles = {
	messageSender: {
		fontSize: "15px",
		marginBottom: "3px",
		fontWeight: "bold",
		color: "gray",
	},
}
export default SenderInfoBox
