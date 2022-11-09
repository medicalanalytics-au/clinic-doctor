export const GRAY = "gray"
export const BLACK = "black"
export const OFFBLACK = "#252525"
export const OFFWHITE = "#fdfdfd"
export const MAINCOLOR = "#0a6e8a"
export const MAINCOLOR_LIGHT = "rgb(59, 139, 161)"
export const DARKGRAY = "#313131"
export const WHITE = "white"
export const GREEN = "green"
export const RED = "red"
export const SILVER = "silver"
export const AMBER = "rgb(254,195,77)"

export const zeroTime = { hour: 0, minute: 0, second: 0, millisecond: 0 }
export const zeroSeconds = { second: 0, millisecond: 0 }
export const center = { display: "flex", justifyContent: "center", alignItems: "center" }
export const redborder = { border: "1px solid red" }
export const blueborder = { border: "1px solid blue" }

export const SEC_1 = 1000
export const SEC_2 = 2000
export const MIN_1 = 60000
export const MIN_3 = 180000
export const MIN_5 = 300000
export const MIN_8 = 480000
export const MIN_10 = 600000
export const MIN_12 = 720000
export const MIN_13 = 780000
export const MIN_14 = 840000
export const MIN_15 = 900000
export const MIN_20 = 1200000
export const HOUR_1 = 3600000
export const HOUR_3 = 10800000
export const HOUR_12 = 43200000
export const HOUR_24 = 86400000

export const CLINIC_OPEN_PERIOD = HOUR_3 // elapsed time before clinic is automatically closed

export const REQUESTSTATUS = {
	PENDING_PAYMENT: "pending_payment",
	CONFIRMED: "confirmed",
	MISSED: "missed",
	ASSIGNED: "assigned",
	CANCELLED: "cancelled",
}

export const SESSION = {
	PAUSED: "paused",
	RESUME: "resume",
	STARTED: "started",
	STOP: "stop",
	COMPLETED: "completed",
}

export const MEDIA = {
	MOBILE: "mobile",
	TABLET: "tablet",
	DESKTOP: "desktop",
}

export const ORIENTATION = {
	PORTRAIT: "portrait",
	LANDSCAPE: "landscape",
}

export const APPOINTMENT_TYPE = {
	CONSULTATION: "consultation",
	ONLINE: "online",
}

export const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export const blankDoctorProfile = {
	_id: "",
	title: "",
	profileName: "",
	fullname: "",
	email: "",
	dateOfBirth: "",
	sex: "",
	languages: [],
	practice: "",
	profilePic: null,
	qualifications: [],
	specialisations: [],
	active: false,
	verified: false,
}

export const blankConsultationDetails = {
	name: "",
	acceptedDate: 0,
	bookingDate: 0,
	clinic_address: "",
	clinic_id: "",
	clinic_name: "",
	completedDate: 0,
	confirmationDate: 0,
	datetime: 0,
	doctor_id: "",
	doctor_name: "",
	paid: 0,
	patient_id: "",
	payable: 0,
	prescriptions: [],
	status: "",
	statusChangedACK: false,
	notes: { saved: false, status: "", text: "" },
}

export const blankPrescription = {
	_id: null,
	medication: "",
	substitutionAllowed: true,
	quantity: 0,
	refill: 0,
	sig: "",
	strength: "",
}
