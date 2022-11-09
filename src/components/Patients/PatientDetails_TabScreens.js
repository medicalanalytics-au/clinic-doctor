import React, { useContext, useState } from "react"
import "../../App.css"
import PropTypes from "prop-types"
import { DateTime } from "luxon"

// material ui
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material"

// react icons
import { BsSortDown, BsSortUp } from "react-icons/bs"
import { FaFilePrescription, FaNotesMedical } from "react-icons/fa"

// custom functions
import { useResponsiveMedia } from "../../utils/helpers"

// constants
import { center, MEDIA, ORIENTATION } from "../../utils/constants"

// custom components
import SpeedButton from "../Common/SpeedButton"

// context
import { ProfileContext } from "../../App"
import { setShowConsultationDetails } from "../../utils/context"

const NoData = ({ text }) => <div style={{ ...center, height: "100%" }}>No {text} recorded</div>

export const Allergies = ({ data }) => <div style={styles.mainContainer}>{data === "" ? <NoData text="allergies" /> : <div>{data}</div>}</div>

export const MedicalHistory = ({ data }) => (
	<div style={styles.mainContainer}>{data === "" ? <NoData text="medical history" /> : <div>{data}</div>}</div>
)

const Cell = ({ text, hideMobile, width, header }) => {
	const media = useResponsiveMedia()
	const mobilePortrait = () => media.type === MEDIA.MOBILE && media.orientation === ORIENTATION.PORTRAIT
	const InnerCell = () => (
		<TableCell style={{ fontWeight: header ? "bold" : "normal", width: width && !mobilePortrait() ? width : "auto" }}>{text}</TableCell>
	)
	return !hideMobile ? <InnerCell /> : !mobilePortrait() ? <InnerCell /> : null
}

const SpeedButtonCell = ({ descending, setDescending }) => {
	return (
		<TableCell style={{ borderBottom: 0 }}>
			<SpeedButton onClick={() => setDescending((descending) => !descending)} icon={descending ? <BsSortUp /> : <BsSortDown />} />
		</TableCell>
	)
}

export const Prescriptions = (props) => {
	const [descending, setDescending] = useState(false)

	return (
		<div style={styles.mainContainer}>
			{!props.data || props.data.length === 0 ? (
				<NoData text="prescriptions" />
			) : (
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow>
								<Cell text="Date" header />
								<Cell text="Time" hideMobile header />
								<Cell text="Doctor" hideMobile header />
								<Cell text="Medication" header />
								<SpeedButtonCell descending={descending} setDescending={setDescending} />
							</TableRow>
						</TableHead>
						<TableBody>
							{props.data
								.sort((a, b) => (descending ? a.datetime - b.datetime : b.datetime - a.datetime))
								.map((i) => {
									return (
										<TableRow key={i._id}>
											<Cell text={DateTime.fromMillis(i.datetime).toLocaleString(DateTime.DATE_SHORT)} />
											<Cell text={DateTime.fromMillis(i.datetime).toLocaleString(DateTime.TIME_SIMPLE)} hideMobile />
											<Cell text={i.doctor_name} hideMobile />

											<TableCell style={{ width: "50%", textOverflow: "ellipsis" }}>
												{i.prescriptions.reduce((p, c, i) => (i > 0 ? p + ", " + c.medication : c.medication), "")}
											</TableCell>
										</TableRow>
									)
								})}
						</TableBody>
					</Table>
				</TableContainer>
			)}
		</div>
	)
}

Prescriptions.propTypes = {
	data: PropTypes.array,
}

export const Notes = (props) => {
	const [descending, setDescending] = useState(false)

	return (
		<div style={styles.mainContainer}>
			{!props.data || props.data.length === 0 ? (
				<NoData text="notes" />
			) : (
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow>
								<Cell text="Date" header />
								<Cell text="Time" hideMobile header />
								<Cell text="Doctor" hideMobile header />
								<Cell text="Notes" header />
								<SpeedButtonCell descending={descending} setDescending={setDescending} />
							</TableRow>
						</TableHead>
						<TableBody>
							{props.data
								.sort((a, b) => (descending ? a.datetime - b.datetime : b.datetime - a.datetime))
								.map((i) => {
									return (
										// TODO NOT COMPLETE!!!!
										<TableRow key={i._id} onClick={() => console.log(i._id)}>
											<Cell text={DateTime.fromMillis(i.datetime).toLocaleString(DateTime.DATE_SHORT)} />
											<Cell text={DateTime.fromMillis(i.datetime).toLocaleString(DateTime.TIME_SIMPLE)} hideMobile />
											<Cell text={i.doctor_name} hideMobile />
											<TableCell style={{ width: "50%", textOverflow: "ellipsis" }}>{i.notes.text}</TableCell>
										</TableRow>
									)
								})}
						</TableBody>
					</Table>
				</TableContainer>
			)}
		</div>
	)
}

Notes.propTypes = {
	data: PropTypes.array,
}

export const Consultation = (props) => {
	const { dispatch } = useContext(ProfileContext)
	const [descending, setDescending] = useState(false)

	return (
		<div style={styles.mainContainer}>
			{!props.data || props.data.length === 0 ? (
				<NoData text="consultation history" />
			) : (
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow>
								<Cell text="Date" header />
								<Cell text="Time" hideMobile header />
								<Cell text="Doctor" header />
								<SpeedButtonCell descending={descending} setDescending={setDescending} />
							</TableRow>
						</TableHead>
						<TableBody>
							{props.data
								.sort((a, b) => (descending ? a.datetime - b.datetime : b.datetime - a.datetime))
								.map((i) => {
									return (
										<TableRow key={i._id} onClick={() => setShowConsultationDetails(dispatch, { show: true, id: i._id })}>
											<Cell text={DateTime.fromMillis(i.datetime).toLocaleString(DateTime.DATE_SHORT)} /* width="100px"  */ />
											<Cell text={DateTime.fromMillis(i.datetime).toLocaleString(DateTime.TIME_SIMPLE)} hideMobile /* width="45px" */ />
											<Cell text={i.doctor_name} width="100%" />

											<TableCell style={{ borderBottom: 0 }}>
												<div style={{ display: "flex", flexDirection: "row" }}>
													<div>{i.prescriptions && i.prescriptions.length > 0 && <FaFilePrescription />}</div>
													<div>{i.notes && <FaNotesMedical />}</div>
												</div>
											</TableCell>
										</TableRow>
									)
								})}
						</TableBody>
					</Table>
				</TableContainer>
			)}
		</div>
	)
}

Consultation.propTypes = {
	data: PropTypes.array,
}

const styles = {
	mainContainer: {
		margin: "10px",
		height: "90%",
		padding: "10px",
		boxShadow: "1px 1px 2px 2px silver",
	},
}
