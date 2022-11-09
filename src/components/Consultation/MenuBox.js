import "../../App.css"
import PropTypes from "prop-types"

import PopUpDialog from "../Common/PopUpDialog"

const MenuBox = (props) => {
	return <PopUpDialog open={props.open} close={props.close} menu={props.menu} />
}

MenuBox.propTypes = {
	open: PropTypes.bool,
	close: PropTypes.func,
	menu: PropTypes.array,
}

export default MenuBox
