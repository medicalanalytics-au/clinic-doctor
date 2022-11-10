/**
 * Landing Page
 * 
 * Note: serviceWorker will be implemented for browser notifications
 *       - will be removed when app is completed and notifications will come through the app
 * 
 */

import { useEffect, useState } from "react"
import "../App.css"
import PropTypes from "prop-types"

// material ui
import { Grow } from "@mui/material"

// images
import child_smile from "../../src/images/child_smile.jpg"
import convenience_video from "../../src/images/convenience_video.jpg"
import logo from "../../src/images/medicalanalyticstransparentbackground.png"

// custom components
import LoginBox from "./LoginBox"

const WELCOME_TITLE = "Online dental consultation"

const FIRST_TITLE = "Protect their smile"
const SECOND_TITLE = "Connect anywhere"

const FIRST_CAPTION = "Whether it is something of an immediate concern, or just to alleviate their worries, you can be available almost instantaneously"
const SECOND_CAPTION = "At the comfort of your home, in the office, or just anywhere. Reach out to your patients through your computer or mobile devices"

const Header = () => {
	return (
		<div className="header">
			<img src={logo} alt="logo" style={styles.logo} />
		</div>
	)
}

const Title = () => {
	return <div className="welcomeTitle">{WELCOME_TITLE}</div>
}

const Captions = () => {
	const [loaded, setLoaded] = useState(false)

	useEffect(() => {
		setLoaded(true)
		return () => setLoaded(false)
	}, [])

	return (
		<div className="captions">
			<Grow in={loaded} style={{ transformOrigin: "0 0 0" }} {...(loaded ? { timeout: 1500 } : {})}>
				<div
					className="captionBox captionBox1"
					onClick={async () => {
						// * trying out desktop notifications
						console.log("serviceWorker" in navigator && "PushManager" in window)
						return await Notification.requestPermission()
					}}
				>
					<img src={child_smile} alt="child smile" className="captionImage captionImage1" />
					<div className="captionText captionText1">
						<h4 className="h4Bold">{FIRST_TITLE}</h4>
						<h4 className="h4Normal">{FIRST_CAPTION}</h4>
					</div>
				</div>
			</Grow>

			<Grow in={loaded} style={{ transformOrigin: "0 0 0" }} {...(loaded ? { timeout: 3000 } : {})}>
				<div className="captionBox captionBox2">
					<div className="captionText captionText2">
						<h4 className="h4Bold">{SECOND_TITLE}</h4>
						<h4 className="h4Normal">{SECOND_CAPTION}</h4>
					</div>
					<img src={convenience_video} alt="child smile" className="captionImage captionImage2" />
				</div>
			</Grow>
		</div>
	)
}

const LandingPage = (props) => {
	return (
		<>
			<div className="dentistbackgroundimage" />
			<Header />
			<Title />
			<Captions />
			<LoginBox onLogin={(res) => props.onLogin(res)} />
		</>
	)
}

LandingPage.propTypes = {
	onLogin: PropTypes.func,
}

const styles = {
	loginHeader: {
		width: "80%",
		margin: "10px",
	},
	loginTextfield: {
		width: "80%",
		marginBottom: "10px",
	},
	helperText: {
		fontSize: "10px",
		cursor: "pointer",
		marginBottom: "10px",
	},
	logo: {
		height: "45px",
		marginLeft: "50px", 
	},
}
export default LandingPage
