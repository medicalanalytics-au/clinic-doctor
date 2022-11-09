import { useContext, useEffect } from "react"
import "../../App.css"
import PropTypes from "prop-types"

// custom components
// import DashboardModal from "./DashboardModal" // TODO REMOVE CLASS TO OLD CODES
import Appointments from "../Appointments/Appointments"
import DisplayContainer from "../Common/DisplayContainer"

// context
import { ProfileContext } from "../../App"
import { setSessionReady, setVideoScreenStatus } from "../../utils/context"

// Swal
import { addDialog } from "../../utils/context"
import { GenericDialog } from "../../utils/sweetalertDialogs"

const Dashboard = (props) => {
	/* 	const [modalOpen, setModalOpen] = useState(false)
	const [modalTitle, setModalTitle] = useState("")
	const [modalContent, setModalContent] = useState(null)
 */
	const { state, dispatch } = useContext(ProfileContext)
	const { title, profileName, peer, socket, _id, consultation } = state
	const { doctor_appointment_id } = consultation

	useEffect(() => {
		// * socket resume signal is handled here to ensure that it is available app-wide
		const handler = () => {
			if (!peer) {
				addDialog(dispatch, {
					dialog: GenericDialog("Resume session?"),
					onConfirm: () => {
						socket.emit("doctor_ready", { appointment_id: doctor_appointment_id, doctor_id: _id, id: 3 })

						setVideoScreenStatus(dispatch, "Waiting for patient")
						setSessionReady(dispatch, true)
					},
				})
			}
		}

		socket.on("patient_consultation_resume", handler)
		return () => socket.off("patient_consultation_resume", handler)
	}, [socket, dispatch, _id, doctor_appointment_id, peer])

	return (
		<DisplayContainer title="APPOINTMENTS">
			{/* <DashboardModal open={modalOpen} close={() => setModalOpen(false)} title={modalTitle} content={modalContent} /> */}
			<Appointments />
			<div className="dashboardEmailDisplay">
				{title}. {profileName}
			</div>
		</DisplayContainer>
	)
}

Dashboard.propTypes = {
	close: PropTypes.func,
}

export default Dashboard
