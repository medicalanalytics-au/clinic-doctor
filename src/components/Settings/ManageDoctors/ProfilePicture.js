import { useContext, useEffect, useRef, useState } from "react"
import "../../../App.css"
import PropTypes from "prop-types"

// context
import { ProfileContext } from "../../../App"

import { center, redborder } from "../../../utils/constants"
import { Button } from "@mui/material"
import { addDialog } from "../../../utils/context"
import { GenericDialog } from "../../../utils/sweetalertDialogs"
import { useResponsiveMedia } from "../../../utils/helpers"

const ProfilePicture = (props) => {
	const { dispatch } = useContext(ProfileContext)

	const [picture, setPicture] = useState(props.picture)

	const media = useResponsiveMedia()

	useEffect(() => {
		setPicture(props.picture)
	}, [props.picture])

	const inputRef = useRef()

	const selectPicture = () => inputRef.current.click()

	const handleFileSelect = (e) => {
		const reader = new FileReader()
		reader.readAsDataURL(e.target.files[0])
		reader.onloadend = (event) => {
			setPicture(event.target.result)
			e.target.value = null
			props.onProfilePictureChanged(event.target.result)
		}
	}

	const removePicture = () => {
		addDialog(dispatch, {
			dialog: GenericDialog("Remove profile picture?"),
			onConfirm: () => {
				setPicture(null)
				props.onProfilePictureChanged(null)
			},
		})
	}

	const stylesTable = {
		desktop: {
			portrait: {
				imageContainer: {
					height: "100%",
				},
			},
			landscape: {
				imageContainer: {
					height: "100%",
				},
			},
		},
		mobile: {
			portrait: {
				imageContainer: {
					height: "100px",
				},
			},
			landscape: {
				imageContainer: {
					height: "200px",
				},
			},
		},
		tablet: {
			portrait: {
				imageContainer: {
					height: "150px",
				},
			},
			landscape: {
				imageContainer: {
					height: "200px",
				},
			},
		},
	}

	const styles = {
		...subStyles,
		image: {
			...supportStyles.image,
			height: "60%",
		},
		imageContainer: {
			...supportStyles.imageContainer,
			height: stylesTable[media.type][media.orientation].imageContainer.height,
		},
	}

	return (
		<div style={styles.mainContainer}>
			{picture ? (
				<div style={styles.imageContainer}>
					<img src={picture} alt="profile" style={styles.image} />
				</div>
			) : (
				<div style={{ textAlign: "center", height: "100%", ...center, ...redborder }}>No profile picture available</div>
			)}
			<div style={{ display: "flex", flexDirection: "column" }}>
				{picture && (
					<Button style={{ marginTop: "10px", width: "200px" }} onClick={removePicture}>
						Remove Picture
					</Button>
				)}
				<Button variant="outlined" style={{ marginTop: "10px", marginBottom: "10px", width: "200px" }} onClick={selectPicture}>
					Upload Picture
				</Button>
				<input ref={inputRef} id="inputFile" type="file" accept=".jpg,.jpeg,.png" onChange={handleFileSelect} style={{ display: "none" }} />
			</div>
		</div>
	)
}

ProfilePicture.propTypes = {
	picture: PropTypes.string,
	onProfilePictureChanged: PropTypes.func,
}

const supportStyles = {
	image: {
		maxWidth: "80%",
		objectFit: "contain",
	},
	imageContainer: {
		display: "flex",
		justifyContent: "center",
		width: "80%",
	},
}

const subStyles = {
	mainContainer: {
		display: "flex",
		flexDirection: "column",
		height: "100%",
		width: "100%",
		alignItems: "center",
		justifyContent: "space-between",
		// border: "1px solid silver",
		borderRadius: "5px",
	},
}
export default ProfilePicture
