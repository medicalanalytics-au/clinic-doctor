// TODO: check usage

import { useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"

// react icons
import { BsQuestion } from "react-icons/bs"

// constants
import { center } from "../../utils/constants"

const SpeedButton = (props) => {
	const buttonRef = useRef()
	const [buttonHeight, setButtonHeight] = useState(0)

	const { onClick, icon } = props

	useEffect(() => {
		buttonRef.current && setButtonHeight(buttonRef.current?.clientHeight)
	}, [])

	const buttonClick = () => onClick && onClick()

	return (
		<div style={{ ...styles.speedButton, width: buttonHeight }} onClick={buttonClick} ref={buttonRef}>
			{icon ? icon : <BsQuestion />}
		</div>
	)
}

const styles = {
	speedButton: {
		...center,
		border: "1px solid silver",
		borderRadius: "3px",
		paddingTop: "3px",
		paddingBottom: "3px",
	},
}

SpeedButton.propTypes = {
	onClick: PropTypes.func,
	icon: PropTypes.element,
}

export default SpeedButton
