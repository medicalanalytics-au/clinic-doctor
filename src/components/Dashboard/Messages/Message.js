import { useCallback, useContext, useEffect, useRef, useState } from "react"
import "../../../App.css"
import PropTypes from "prop-types"
import { DateTime } from "luxon"
import { isEqual } from "lodash"

// material ui
import { Button, TextField } from "@mui/material"

// react icons
import { RiFlag2Fill, RiMailUnreadFill } from "react-icons/ri"

// context
import { setMessageRecipient, showSnack } from "../../../utils/context"

// custom functions
import { now, showError, useResponsiveMedia } from "../../../utils/helpers"
import { MAINCOLOR, MAINCOLOR_LIGHT, MEDIA, ORIENTATION } from "../../../utils/constants"

// Swal
import { addDialog } from "../../../utils/context"
import { GenericDialog } from "../../../utils/sweetalertDialogs"

// network
import { common_deleteDraftMessage } from "../../../utils/network"

// context
import { ProfileContext } from "../../../App"

const VIEW = {
	INBOX: "inbox",
	DRAFT: "draft",
	SENT: "sent",
}

const MODE = {
	READ: "read",
	EDIT: "edit",
}

const Message = (props) => {
	const { state, dispatch } = useContext(ProfileContext)
	const { practices, title, profileName, _id, message } = state
	const { recipient, body, mode } = message

	const { view, onModeChange } = props

	const textfieldRef = useRef()

	const inboxView = () => props.view === VIEW.INBOX
	const draftView = () => props.view === VIEW.DRAFT && body._id

	const sentView = () => props.view === VIEW.SENT

	const [messageRead, setMessageRead] = useState(true)

	const [originalReply, setOriginalReply] = useState("") // use to compare changes in the text msg
	const [reply, setReply] = useState("")

	const replyTextModified = () => reply !== originalReply

	const editMode = () => mode === MODE.EDIT
	const readMode = useCallback(() => mode === MODE.READ, [mode])

	const [newSubject, setNewSubject] = useState(body?.subject || "")
	const [messageId, setMessageId] = useState()
	const [selectedRecipient, setSelectedRecipient] = useState()

	const noRecipient = () => !selectedRecipient || isEqual(selectedRecipient, { id: null, name: null })

	const media = useResponsiveMedia()
	const mobileLandscape = () => media.type === MEDIA.MOBILE && media.orientation === ORIENTATION.LANDSCAPE

	const formatDate = (datetime) => (datetime ? DateTime.fromMillis(datetime).toLocaleString(DateTime.DATETIME_SHORT) : "")

	useEffect(() => {
		if (view === VIEW.DRAFT && reply.length === 0 && originalReply.length === 0) {
			!message.recipient &&
				setMessageRecipient(dispatch, {
					id: body?.to_id,
					name: body?.to,
				})
			setReply(body?.text)
			setOriginalReply(body?.text)
			readMode() && onModeChange(MODE.EDIT)
		}
	}, [reply, view, originalReply, message.recipient, body?.to_id, body?.to, body?.text, dispatch, onModeChange, readMode])

	useEffect(() => {
		recipient && setSelectedRecipient(recipient)
	}, [recipient])

	useEffect(() => {
		if (body?._id && messageId !== null) setMessageId(body._id)
	}, [body?._id, messageId])

	useEffect(() => {
		readMode() && setNewSubject(body?.subject || "")
	}, [readMode, body?.subject])

	const styles = {
		...subStyles,
		outerContainer: {
			...supportStyles.outerContainer,
			height: mobileLandscape() ? "80%" : "90%",
		},
		footer: {
			...supportStyles.footer,
			height: mobileLandscape() ? "20%" : "10%",
		},
	}

	const discardDraft = () => {
		props.onModeChange(MODE.READ)
		!body?.datetime && props.close()
	}

	const replyMessage = () => {
		setSelectedRecipient({
			id: body?.from_id,
			name: body?.from,
		})
		setMessageId(null)
		setNewSubject("Re: " + newSubject)
		const quotedText =
			"\n\n================================\nIn reply to:\n" +
			body?.from +
			(body?.from_practice ? "\n" + body?.from_practice : "") +
			"\non: " +
			formatDate(body?.datetime) +
			"\n\n" +
			body?.text
		setReply(quotedText)
		setOriginalReply(quotedText)
		props.onModeChange(MODE.EDIT)
	}

	const submitMessage = (datetime) => {
		const clinic = practices[0]

		const message = {
			message_id: messageId,
			to: selectedRecipient?.name,
			to_id: selectedRecipient?.id,
			// TODO - //
			// TODO - // to_practice  and to_practice_name will be implemented when doctor-to-doctor messaging is enabled
			// TODO - // - check/add selectedRecipient fields for additional practice info
			// TODO - //
			datetime,
			from: (title ? title + ". " : "") + profileName,
			from_id: _id,
			from_practice: clinic.practice, // * see note below
			from_practice_address: (clinic.city ? clinic.city + ". " : "") + clinic.state, // * see note below
			read: false,
			subject: newSubject,
			text: reply,
		}

		// * note: from_practice and from_practice_address is populated only on doctor's side of app

		props.onMessageSubmit(message)
	}

	const reportMessage = () => {
		const clinic = practices[0]

		const message = {
			to: "Admin",
			to_id: "ADMIN",
			datetime: now(),
			from: "Admin",
			from_id: "ADMIN",
			read: false,
			subject: "Message reported",
			text:
				"Reported by\nId: " +
				_id +
				"\nName:" +
				(title ? title + ". " : "") +
				profileName +
				"\n\nClinic:" +
				"id: " +
				clinic._id +
				(clinic.practice && "\n" + clinic.practice) +
				(clinic.phone && "\n" + clinic.phone) +
				(clinic.email && "\n" + clinic.email) +
				(clinic.address && "\n" + clinic.address) +
				(clinic.suburb && "\n" + clinic.suburb) +
				(clinic.city && "\n" + clinic.city) +
				(clinic.postalCode && "\n" + clinic.postalCode) +
				(clinic.state && "\n" + clinic.state),
		}

		props.onMessageSubmit(message)
		showSnack(dispatch, "Report sent")
	}

	return (
		<div style={styles.body}>
			<div style={styles.outerContainer}>
				<div style={styles.messageInfoContainer}>
					<div style={styles.subject}>
						{body?.datetime ? ( // empty datetime indicates an editable message
							<div style={{ margin: "5px" }}>{newSubject}</div>
						) : (
							<TextField
								size="small"
								fullWidth
								value={newSubject}
								autoComplete="off"
								placeholder="<No subject>"
								InputProps={{
									style: { color: "white" },
								}}
								onChange={(e) => setNewSubject(e.target.value)}
							/>
						)}
					</div>
					<div style={styles.date}>{readMode() ? (inboxView() ? "Received on " : "Sent on ") + formatDate(body?.datetime) : ""}</div>
				</div>
				<div style={styles.textContainer} onClick={() => textfieldRef.current && textfieldRef.current.focus()}>
					{readMode() ? (
						<div style={{ margin: "10px" }}>{body?.text}</div>
					) : (
						<TextField
							inputRef={textfieldRef}
							fullWidth
							autoFocus
							multiline
							variant="standard"
							InputProps={{ disableUnderline: true }}
							value={reply}
							onChange={(e) => setReply(e.target.value)}
						/>
					)}
				</div>
			</div>
			<div style={styles.footer}>
				<div style={styles.leftButtonContainer}>
					{!body?.datetime || editMode() ? (
						<Button
							onClick={() => {
								if (replyTextModified()) {
									addDialog(dispatch, {
										dialog: GenericDialog("Discard message?"),
										onConfirm: discardDraft,
									})
								} else discardDraft()
							}}
						>
							Cancel
						</Button>
					) : (
						readMode() &&
						props.view === VIEW.INBOX && (
							<div>
								<RiMailUnreadFill
									style={{ marginRight: "10px", color: messageRead ? "silver" : MAINCOLOR }}
									onClick={() => {
										showSnack(dispatch, "Message marked as " + (messageRead ? "unread" : "read"))
										props.onChangeReadStatus(messageId, !messageRead)
										setMessageRead(!messageRead)
									}}
								/>
								<RiFlag2Fill
									style={{ color: "silver" }}
									onClick={() => {
										addDialog(dispatch, {
											dialog: GenericDialog("Report this email?"),
											onConfirm: () => {
												reportMessage()
											},
										})
									}}
								/>
							</div>
						)
					)}

					{draftView() && (
						<Button
							onClick={() =>
								addDialog(dispatch, {
									dialog: GenericDialog("Delete draft?"),
									onConfirm: () => {
										common_deleteDraftMessage(dispatch, messageId)
											.then(() => props.onDraftDeleted(messageId))
											.catch((error) => showError(dispatch, error))
										props.close()
									},
								})
							}
						>
							Delete
						</Button>
					)}
				</div>
				<div style={styles.rightButtonContainer}>
					{(editMode() || (readMode() && !sentView())) && (
						<Button
							style={{ marginRight: "5px" }}
							disabled={
								editMode() &&
								((!draftView() && !replyTextModified() && reply.length > 0) || (reply.length === 0 && noRecipient() && newSubject.length === 0))
							}
							onClick={() => (readMode() ? replyMessage() : submitMessage(null))}
						>
							{readMode() ? "Reply" : "Draft"}
						</Button>
					)}

					<Button
						variant="contained"
						disabled={editMode() && ((!draftView() && !replyTextModified()) || reply.length === 0 || !selectedRecipient || newSubject.length === 0)}
						onClick={() => {
							if (readMode()) props.close()
							else {
								addDialog(dispatch, {
									dialog: GenericDialog("Send mail?"),
									onConfirm: () => submitMessage(now()),
								})
							}
						}}
					>
						{readMode() ? "Close" : "Send"}
					</Button>
				</div>
			</div>
		</div>
	)
}

Message.propTypes = {
	onMessageSubmit: PropTypes.func,
	onChangeReadStatus: PropTypes.func,
	onDraftDeleted: PropTypes.func,
	view: PropTypes.string,
	onModeChange: PropTypes.func,
	close: PropTypes.func,
}

const supportStyles = {
	outerContainer: {
		position: "absolute",
		top: 0,
		left: 0,
		width: "100%",
		display: "flex",
		flexDirection: "column",
		justifyContent: "flex-start",
	},
	footer: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-end",
		marginBottom: "10px",
		marginLeft: "10px",
		marginRight: "10px",
	},
}

const subStyles = {
	body: {
		position: "relative",
		height: "90%",
		width: "100%",
		display: "flex",
		flexDirection: "column",
		justifyContent: "flex-end",
	},
	messageInfoContainer: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		borderBottom: "1px solid silver",
	},
	subject: {
		backgroundColor: MAINCOLOR_LIGHT,
		width: "98%",
		color: "white",
		fontWeight: "bold",
		marginBottom: "5px",
	},
	date: {
		width: "98%",
		fontSize: "12px",
		marginBottom: "5px",
	},
	textContainer: {
		height: "85%",
		whiteSpace: "pre-wrap",
		overflow: "scroll",
		resize: "none",
		boxSizing: "border-box",
		margin: "10px",
		color: "black",
		borderBottom: "3px double silver",
	},
	leftButtonContainer: {
		display: "flex",
		flexDirection: "row",
		height: "100%",
		alignItems: "flex-end",
	},
	rightButtonContainer: {
		display: "flex",
		flexDirection: "row",
	},
}
export default Message
