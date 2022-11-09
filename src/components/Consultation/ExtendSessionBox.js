import { useContext } from "react"
import "../../App.css"
import PropTypes from "prop-types"

// constants
import { MIN_5 } from "../../utils/constants"

// Swal
import { addDialog } from "../../utils/context"
import { GenericDialog } from "../../utils/sweetalertDialogs"

// context
import { ProfileContext } from "../../App"
import PopUpDialog from "../Common/PopUpDialog"

const ExtendSessionBox = (props) => {
	const value = useContext(ProfileContext)
	const { dispatch } = value

	const add = (title, time) => {
		addDialog(dispatch, {
			dialog: GenericDialog(title, "Confirm"),
			onConfirm: () => props.onExtend && props.onExtend(time),
		})
	}

	// PopUpDialog menu is an array of:
	// [{
	//     label: string,
	//     onClick: callback onClick()
	// }]
	
	const menu =
		props?.availableTime?.map((i) => {
			return {
				label: i === MIN_5 ? "5 mins (non chargeable)" : "15 mins (chargeable)",
				onClick:
					i === MIN_5
						? () => add("Extend this session by 5 minutes?", 5)
						: () => add("Extend this session by 15 minutes?<p>Patient will be charged for the extension", 15),
			}
		}) || []
	return <PopUpDialog open={props.open} close={props.close} title={"Extend this session"} menu={menu} />
}

ExtendSessionBox.propTypes = {
	open: PropTypes.bool,
	close: PropTypes.func,
	availableTime: PropTypes.array,
	onExtend: PropTypes.func,
}

export default ExtendSessionBox
