// TODO: check usage

import "../../App.css"
import PropTypes from "prop-types"

// material ui
import { List, ListItem, ListItemButton, ListItemText, Modal } from "@mui/material"

// react icons
import { IoCloseOutline } from "react-icons/io5"

// constants
import { center, WHITE } from "../../utils/constants"

// PopUpDialog menu is an array of:
// [{
//     title: string,
//     onClick: callback onClick()
// }]

const PopUpDialog = (props) => {
	const { open, close, title, menu } = props

	return (
		<Modal open={open} onClose={close}>
			<div style={styles.mainContainer}>
				<div className="glass" style={styles.dialog}>
					<div style={{ display: "flex", justifyContent: "flex-end" }}>
						<IoCloseOutline style={{ cursor: "pointer" }} onClick={close} />
					</div>
					<div style={{ fontWeight: "bold", fontSize: "20px" }}>{title}</div>

					<List /* subheader={<ListSubheader component={"div"}>{props.title}</ListSubheader>} */>
						{menu &&
							menu.map((i) => {
								return (
									<ListItem
										key={i.label}
										disablePadding
										onClick={() => {
											i.onClick()
											close()
										}}
									>
										<ListItemButton>
											<ListItemText style={styles.listItemText} primary={i.label} />
										</ListItemButton>
									</ListItem>
								)
							})}
					</List>
				</div>
			</div>
		</Modal>
	)
}

PopUpDialog.propTypes = {
	open: PropTypes.bool,
	close: PropTypes.func,
	title: PropTypes.string,
	menu: PropTypes.array,
}

const styles = {
	mainContainer: {
		...center,
		width: "100%",
		height: "100%",
		color: WHITE,
	},
	dialog: {
		width: "20rem",
		padding: "10px",
	},
	listItemText: {
		marginLeft: "10px",
		fontWeight: "bold",
		fontSize: "12px",
	},
}
export default PopUpDialog
