/**
 * Main entry point
 * 
 * This file renders either a <Main/> or <LandingPage/>, depending on login status
 * 
 * <LandingPage/> will perform these functions through the onLogin prop sent to it's child <LoginBox/> component:
 *	- createSocket()
 *	- login() 					  - add socket details to Context state
 *	- common_loadGlobalSettings() - updates the Context state
 * 
 * It loads 3 components that will be used universally throughout application, which will be rendered depending
 * on the Context state status of the component 
 *  	- <Snackbar/>
 *  	- <Spinner/>
 *  	- <Message/> - loaded through a <ModalScreen/> component
 * 
 */

// TODO --------------- <LandingPage/>
// TODO - add sessiontokens
// TODO - encrypt login data

import { createContext, useReducer } from "react"
import "./App.css"
import { Helmet } from "react-helmet"

// icons
import mail from "./images/mail.png"

// material ui
import { Snackbar, SnackbarContent, ThemeProvider } from "@mui/material"

// custom functions
import { createSocket, THEME } from "./utils/helpers"
import { changeReadStatus, deleteDraftMessageFromList, submitMessage } from "./components/Dashboard/Messages/Messages"

// custom components
import LandingPage from "./components/LandingPage"
import Main from "./components/Main"
import Spinner from "./components/Common/Spinner"

// context
import { reducer, initialState, login, logout, hideSnack, closeMessage, setMessageMode, setGlobalSettings } from "./utils/context"

// constants
import { MODE } from "./utils/context"
import { center } from "./utils/constants"

// custom components
import ModalScreen from "./components/Common/ModalScreen"
import Message from "./components/Dashboard/Messages/Message"
import SenderInfoBox from "./components/Dashboard/Messages/SenderInfoBox"

// network
import { common_loadGlobalSettings } from "./utils/network"

export const ProfileContext = createContext()

function App() {
	const [state, dispatch] = useReducer(reducer, initialState)
	const { show, text, fullMode, lightFont } = state.spinner

	const handleClose = (event, reason) => {
		if (reason === "clickaway") {
			return
		}
		hideSnack(dispatch)
	}

	return (
		<ProfileContext.Provider value={{ state, dispatch }}>
			<ThemeProvider theme={THEME}>
				<Snackbar
					sx={{ width: "100%", textAlign: "center", flexGrow: 1 }}
					open={state.showSnack}
					autoHideDuration={3000}
					onClose={handleClose}
					anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
				>
					<SnackbarContent message={state.snackMessage} style={{ ...center }} />
				</Snackbar>

				<Spinner open={show} text={text} fullMode={fullMode} lightFont={lightFont} />

				<ModalScreen
					icon={mail}
					open={state.message.open}
					close={() => closeMessage(dispatch)}
					closeIcon={state.message.mode === MODE.READ}
					content={
						<Message
							onModeChange={(mode) => setMessageMode(dispatch, mode)}
							view={state.message.view}
							new={state.message.new} // * indicates whether this is a new message
							close={() => closeMessage(dispatch)}
							onMessageSubmit={(msg) => submitMessage(dispatch, state._id, msg)}
							onChangeReadStatus={(id, status) => changeReadStatus(dispatch, id, state.messages, status)}
							onDraftDeleted={(id) => deleteDraftMessageFromList(dispatch, id, state.messages)}
						/>
					}
					title={<SenderInfoBox />}
				/>

				<div className="App main">
					<Helmet>
						<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
						<meta name="description" content="Medical Analytics" />
						<title>Online Dental Consultation</title>
					</Helmet>
					{state.loggedIn ? (
						<Main close={() => logout(dispatch)} />
					) : (
						<LandingPage
							onLogin={(payload) => {
								// * connect to socket.io server upon login
								createSocket(payload._id, dispatch, state)
								login(dispatch, payload) // add socket details to state
								common_loadGlobalSettings(dispatch)
									.then((res) => setGlobalSettings(dispatch, res))
									.catch((error) => console.log({ error }))
							}}
						/>
					)}
				</div>
			</ThemeProvider>
		</ProfileContext.Provider>
	)
}

export default App


