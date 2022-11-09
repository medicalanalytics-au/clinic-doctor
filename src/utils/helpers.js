import { useCallback, useEffect, useState } from "react"
import { DateTime, Duration, Interval } from "luxon"

// socket io
import { io } from "socket.io-client"

// custom socket.io function
import { socketFunctions } from "./sockets"

// material ui
import { createTheme } from "@mui/material/styles"
import { styled } from "@mui/styles"
import { TableCell, tableCellClasses } from "@mui/material"

// context
import {
	setConsultationHistory,
	setMessages,
	setSockets,
	updateAppointmentList,
	VIEW_UNCLOSED_CONSULTATIONS,
} from "./context"

// constants
import { VIEW_ALL_ACTIVE } from "./context"
import { MAINCOLOR, zeroTime, months, MEDIA, ORIENTATION, zeroSeconds } from "./constants"

// network
import { common_downloadMessages, doctor_getPatientsHistory, doctor_loadAppointments2, SERVER } from "./network"

// Swal
import { addDialog } from "./context"
import { GenericError } from "./sweetalertDialogs"

// * MEDIA TYPES ***************************************************************************************************************************************************************
export const useResponsiveMedia = () => {
	const [media, setMedia] = useState({
		width: 0,
		height: 0,
		type: "mobile",
		orientation: "portrait",
	})

	const handleWindowResize = useCallback(() => {
		const width = window.innerWidth
		const height = window.innerHeight

		const orientation = width > height ? "landscape" : "portrait"
		const smallerDim = width < height ? width : height
		const largerDim = width > height ? width : height

		const type = smallerDim < 768 ? "mobile" : largerDim > 1366 ? "desktop" : smallerDim < 1024 ? "tablet" : largerDim === 1366 ? "tablet" : "desktop"
s
		setMedia({
			width,
			height,
			type,
			orientation,
		})
	}, [])

	useEffect(() => {
		handleWindowResize()
		window.addEventListener("resize", handleWindowResize)
		return () => window.removeEventListener("resize", handleWindowResize)
	}, [handleWindowResize])

	return media
}

export const mobile = (media) => media.type === MEDIA.MOBILE
export const tablet = (media) => media.type === MEDIA.TABLET
export const portrait = (media) => media.orientation === ORIENTATION.PORTRAIT
export const mobilePortrait = (media) => media.type === MEDIA.MOBILE && media.orientation === ORIENTATION.PORTRAIT
export const mobileLandscape = (media) => media.type === MEDIA.MOBILE && media.orientation === ORIENTATION.LANDSCAPE
export const tabletPortrait = (media) => media.type === MEDIA.TABLET && media.orientation === ORIENTATION.PORTRAIT

// ************************************************************************************************************************************************************************

export const validEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase())

export const THEME = createTheme({
	palette: {
		primary: { main: "#0a6e8a" }, // main color
	},
	typography: {
		fontFamily: `"Quicksand", sans-serif`,
		color: MAINCOLOR,
	},
	override: {
		MuiInput: {
			input: {
				fontSize: "12px",
			},
		},
	},
})

export const pluralize = (value, word) => value + " " + word + (value !== 1 ? "s" : "")

export const formatDate = (date, format = DateTime.DATETIME_SHORT) =>
	typeof date === "number" ? DateTime.fromMillis(date).toLocaleString(format) : !date ? "" : date.toLocaleString(format)

export const now = () => DateTime.now().toMillis()

export const current = (date) => date >= now()

export const midnight = {
	today: () => DateTime.now().set(zeroTime).toMillis(),
	tomorrow: () => DateTime.now().plus({ day: 1 }).set(zeroTime).toMillis(),
}

export const prevDay = (date) => date < midnight.today()
export const today = (date) => date >= midnight.today() && date < midnight.tomorrow()

export const getDuration = (ms) => Duration.fromMillis(ms).shiftTo("years", "months", "days", "hours", "minutes", "seconds").toObject()

export const getStringifiedDuration = (startTime, endTime) => {
	if (startTime && endTime) {
		const ms = endTime - startTime
		const { hours, minutes, seconds } = getDuration(ms)
		const min = Math.floor(minutes)

		// * show hours if > 1hr
		const str = (hours > 0 ? pluralize(hours, "hr") : "") + " " + (min > 0 ? pluralize(min, "min") : "")

		// * if duration < 1 min, display in seconds
		return str.trim() === "" ? pluralize(Math.floor(seconds), "second") : str.trim()
	} else return ""
}

export const loadAppointments = (doctor_id, month, year, dispatch) => {
	let from
	let to

	switch (month) {
		case VIEW_ALL_ACTIVE:
			from = "active"
			break
		case VIEW_UNCLOSED_CONSULTATIONS:
			from = "unclosed"
			break
		default:
			from = DateTime.fromObject({ year, month: parseInt(months.indexOf(month)) + 1, day: 1 }).toMillis()

			// * get last day of the month. leap year is auto calculated
			to = DateTime.fromObject({ year, month: months.indexOf(month) + 2, day: 1 })
				.minus({ seconds: 1 })
				.toMillis()

			break
	}

	doctor_loadAppointments2(dispatch, doctor_id, from, to)
		.then((res) => updateAppointmentList(dispatch, res))
		.catch((error) => {
			addDialog(dispatch, {
				dialog: GenericError(error),
			})
		})
}

export const createSocket = (id, dispatch, state) => {
	// let socket = io.connect(SERVER, { transports: ["websocket"], allowUpgrades: false })
	const socket = io.connect(SERVER)
	setSockets(dispatch, socket)
	socketFunctions(socket, id, dispatch, state) // assign socket functions

	return socket
}

export const display = (args) => {
	const str = args.map((i) => (typeof i === "object" ? JSON.stringify(i) : i))

	console.log("%c " + str, "background: #222; color: green; font-weight: bold;")
}

export const log = (level, ...rest) => {
	const LOGLEVEL = 2 // change this for appropriate level, 0 = no logs

	// remove quotes from object property
	const string = (obj) => JSON.stringify(obj, null, 2).replace(/^[\t ]*"[^:\n\r]+(?<!\\)":/gm, (match) => match.replace(/"/g, ""))

	if (LOGLEVEL > 0) {
		let str = ""
		if (level >= LOGLEVEL) {
			for (let i = 0; i <= rest.length - 1; i++) {
				typeof rest[i] === "object" ? (str += (i > 0 ? ", " : "") + string(rest[i])) : (str += (i > 0 ? ", " : "") + rest[i])
			}
		}

		if (level >= LOGLEVEL) console.log(str)
	}
}

export const millisToHoursMinutesSeconds = (millis) => {
	const hr1 = 3600000

	let hours = Math.floor(millis / hr1)
	let minutes = Math.floor((millis - hours * hr1) / 60000)
	let seconds = parseInt(((millis % 60000) / 1000).toFixed(0))

	if (seconds === "60") {
		minutes++
		seconds = "0"
	}

	return {
		hours,
		minutes,
		seconds,
	}
}

export const updatePatientHistory = (patient_id, dispatch) => {
	doctor_getPatientsHistory(dispatch, patient_id)
		.then((res) => setConsultationHistory(dispatch, res))
		.catch((error) => showError(dispatch, error))
}

export const HeaderTableCell = styled(TableCell)(({ theme }) => {
	return {
		[`&.${tableCellClasses.head}`]: {
			backgroundColor: theme.palette.primary.light,
			color: theme.palette.common.white,
			fontWeight: "bold",
		},
	}
})

export const randomDate = () => {
	const YEAR_1 = 31556926000
	const getRandInt = Math.floor(Math.random() * YEAR_1)
	return DateTime.fromMillis(now() - getRandInt).toMillis()
}

export const isToday = (date) => DateTime.fromMillis(date).toISODate() === DateTime.local().toISODate()

export const downloadMessages = (dispatch, id) => {
	common_downloadMessages(dispatch, id)
		.then((res) => setMessages(dispatch, res))
		.catch((error) => showError(dispatch, error))
}

export const unreadMessages = (state) => {
	const { _id, messages } = state
	return messages.reduce((total, current) => {
		current.from_id !== _id && !current.read && total++
		return total
	}, 0)
}

export const todaysAppointments = (appointments) =>
	appointments.reduce((total, current) => {
		isToday(current.startTime) && total++
		return total
	}, 0)

export const renderTime = (time, renderSeconds = true) => {
	// TODO - non urgent (cosmetic, affecting timer that is more than one hour)
	// TODO   -----------------
	// TODO noted below for the error:
	// TODO - fix:
	// TODO -     when hour > 0, set minutes to 00 or blank, and hour to be added with 1

	const { hours, minutes, seconds } = time

	return minutes > 1
		? minutes === 59
			? hours === 0
				? "1 hr"
				: "59 mins" // TODO there is an error here that will cause this time to be rendered for 2 mins
			: minutes + 1 + " mins"
		: minutes === 1
		? "1 min " + (renderSeconds ? (seconds > 0 ? pluralize(seconds, "sec") : "") : "")
		: renderSeconds
		? pluralize(seconds, "sec")
		: ""
}
export const renderer = (time) => {
	// * This is a renderer for react-countdown

	const { days, hours } = time
	return <span>{days > 0 ? pluralize(days, "day") : hours > 0 ? pluralize(hours, "hr") + " " + renderTime(time, false) : renderTime(time)}</span>
}

export const loremIpsum =
	"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."

export const formatStrToHTML = (str) => {
	let tmp = str

	while (tmp.indexOf("\n\n") > -1) tmp = tmp.replace("\n\n", "\n") // remove all double carriage returns
	tmp = tmp.replaceAll("\n", "<br>") // replace carriage returns with <br> tag

	while (tmp.indexOf(" <br>") > -1 || tmp.indexOf("<br> ") > -1 || tmp.indexOf("  ") > -1)
		tmp = tmp.replace(" <br>", "<br>").replace("<br> ", "<br>").replace("  ", " ") // remove space before <br>

	while (tmp.indexOf("<br><br>") > -1) tmp = tmp.replace("<br><br>", "<br>") // remove all double <br>

	if (tmp.substring(0, 4) === "<br>") tmp = tmp.substring(4, tmp.length) // remove leading <br>
	if (tmp.substring(tmp.length - 4) === "<br>") tmp = tmp.substring(0, tmp.length - 4) // remove trailing <br>

	return tmp
}

export const calculateAge = (birthdate) =>
	Math.floor(Interval.fromDateTimes(DateTime.fromFormat(birthdate, "ddMMyyyy"), DateTime.now()).length("years"))

export const showError = (dispatch, errorMsg) => {
	addDialog(dispatch, {
		dialog: GenericError(errorMsg),
	})
}

export const generateTimeList = () => {
	// * generate menu for timeslots in 5 mins gap for 30 minutes max
	const _now = DateTime.now()
	const gap = Math.ceil(_now.minute / 5) * 5 - _now.minute

	const arr = []
	let menuOptions = {}

	for (let x = gap; x <= 30; x = x + 5) {
		let curr = _now.plus({ minute: x }).set(zeroSeconds).toMillis()
		if (curr > _now.toMillis()) arr.push(curr)
	}

	arr.forEach((i) => (menuOptions[i] = DateTime.fromMillis(i).toLocaleString(DateTime.TIME_SIMPLE)))
	
	return menuOptions

}