import { useContext } from "react"
import "../../App.css"
import PropTypes from "prop-types"

// react-icons
import { GiPadlock } from "react-icons/gi"

// material ui
import { Button } from "@mui/material"

// custom components
import Tabs from "../Common/Tabs"
import Password from "../Settings/Password"
import Administrator from "../Settings/Administrator"

// context
import { ProfileContext } from "../../App"
import { center, MAINCOLOR_LIGHT } from "../../utils/constants"

const Settings = (props) => {
	const { state } = useContext(ProfileContext)

	const passwordTab = { title: "Password", screen: <Password />, icon: <GiPadlock /> }
	const adminTab = {
		title: "Administrator",
		screen: <Administrator />,
		icon: <GiPadlock />,
	}

	return (
		<div style={styles.mainContainer}>
			<div style={{ boxShadow: "inset -1px -1px 6px " + MAINCOLOR_LIGHT, height: "80%", width: "80%", padding: "20px", borderRadius: "5px" }}>
				<Tabs content={state.administrator ? [adminTab, passwordTab] : [passwordTab]} />
			</div>
			<div style={{ ...center }}>
				<Button onClick={props.close} variant="contained" style={{ width: "100px" }}>
					Close
				</Button>
			</div>
		</div>
	)
}

Settings.propTypes = {
	close: PropTypes.func,
}

const styles = {
	mainContainer: {
		display: "flex",
		flexDirection: "column",
		color: "black",
		justifyContent: "space-between",
		height: "100%",
		alignItems: "center",
	},
}

export default Settings
