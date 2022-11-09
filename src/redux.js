import { createSlice, configureStore } from "@reduxjs/toolkit"

const initialState = {
	standby: false,
	clinic: null,
	peerStarted: false,
	chat: [],
}

const mainSlice = createSlice({
	name: "main",
	initialState,
	reducers: {
		setStandby: (state, action) => {
			state.standby = action.payload
		},
		setClinic: (state, action) => {
			state.clinic = action.payload
		},
		setPeerStarted: (state, action) => {
			state.peerStarted = action.payload
		},
		setChat: (state, action) => {
			state.chat = action.payload
		},
	},
})

const profileSlice = createSlice({
	name: "Profile",
	initialState: {
		completion: null,
		personalInfo: {
			_id: "",
			title: "",
			fullname: "",
			profileName: "",
			email: "",
			dateOfBirth: {
				year: 0,
				month: 0,
				day: 0,
			},
			sex: "",
			qualifications: [],
			languages: [],
			specialisations: [],
			clinics: [],
		},
		identification: {
			idPicture: null,
			profilePicture: null,
		},
	},
	reducers: {
		setCompletion: (state, action) => {
			state.completion = action.payload
		},
		setPersonalInfo: (state, action) => {
			state.personalInfo = action.payload
		},
		setIdentification: (state, action) => {
			state.identification = action.payload
		},
	},
})

const appointmentsSlice = createSlice({
	name: "Appointments",
	initialState: [],
	reducers: {
		setAppointments: (state, action) => {
			// state = action.payload
			return [...action.payload]
		},
	},
})

const store = configureStore({
	reducer: {
		main: mainSlice.reducer,
		profile: profileSlice.reducer,
		appointments: appointmentsSlice.reducer,
	},
})

export const { setStandby, setClinic, setPeerStarted, setChat } = mainSlice.actions
export const { setCompletion, setPersonalInfo, setIdentification } = profileSlice.actions
export const { setAppointments } = appointmentsSlice.actions

export default store
