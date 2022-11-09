import { useContext, useState } from "react"
import "../App.css"
import PropTypes from "prop-types"

// material ui
import { Button, Checkbox, FormControlLabel, TextField, Tooltip, IconButton } from "@mui/material"

// react icons
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5"

// images
import { doctor_auth } from "../utils/network"

// Swal
import Swal from "sweetalert2"
import { GenericError } from "../utils/sweetalertDialogs"

// context
import { ProfileContext } from "../App"

const LoginBox = (props) => {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [showPassword, setShowPassword] = useState(false)

	const { dispatch } = useContext(ProfileContext)

	const handleLogin = async () => {
		try {
			const res = await doctor_auth(dispatch, email, password)
			props.onLogin(res)
		} catch (error) {
			Swal.fire(GenericError(error.message === "Failed to fetch" ? "Server is offline. Please try again" : error))
		}
	}

	const styles = {
		...subStyles,
		paddedHelperText: {
			...supportStyles.paddedHelperText,
		},
	}

	return (
		<div className="loginBox">
			<div className="loginInnerBox">
				<div style={styles.loginHeader}>
					<div style={{ fontWeight: "bold" }}>Login</div>
					<div style={styles.caption}>connect to your patients now</div>
				</div>

				<TextField
					label="email"
					value={email}
					autoFocus
					InputLabelProps={{ shrink: true }}
					style={styles.loginTextfield}
					onChange={(e) => setEmail(e.target.value)}
				/>

				<TextField
					label="password"
					type={showPassword ? "" : "password"}
					value={password}
					InputProps={{
						endAdornment: showPassword ? (
							<Tooltip title="Hide password">
								<IconButton onClick={() => setShowPassword(false)}>
									<IoEyeOffOutline style={styles.iconSize} />
								</IconButton>
							</Tooltip>
						) : (
							<Tooltip title="Show password">
								<IconButton onClick={() => setShowPassword(true)}>
									<IoEyeOutline style={styles.iconSize} />
								</IconButton>
							</Tooltip>
						),
					}}
					onChange={(e) => setPassword(e.target.value)}
					InputLabelProps={{ shrink: true }}
					style={styles.loginTextfield}
				/>

				<FormControlLabel
					sx={{ marginBottom: "5px", fontSize: 10 }}
					label={<div style={styles.paddedHelperText}>Remember me</div>}
					control={<Checkbox size="small" color="primary" sx={{ fontSize: "10px" }} />}
				/>
				<Button variant="outlined" style={{ width: "40%" }} onClick={handleLogin}>
					Login
				</Button>
				{/* <div style={styles.paddedHelperText}>Having trouble logging in?</div> */}
			</div>
		</div>
	)
}

LoginBox.propTypes = {
	onLogin: PropTypes.func,
}

const subStyles = {
	loginHeader: {
		width: "80%",
		margin: "10px",
	},
	loginTextfield: {
		width: "80%",
		marginBottom: "10px",
	},
	caption: {
		fontSize: "12px",
		marginTop: "5px",
		marginBottom: "10px", ///
	},
	helperText: {
		fontSize: "10px",
		cursor: "pointer",
		marginBottom: "10px",
	},
	logo: {
		height: "40px",
		width: "40px",
		display: "flex",
		marginLeft: "20px",
		alignItems: "center",
		fontSize: "30px",
		flexDirection: "row",
	},
	iconSize: {
		fontSize: "15px", ///
	},
}

const supportStyles = {
	paddedHelperText: {
		...subStyles.helperText,
		marginTop: "10px",
	},
}
export default LoginBox
