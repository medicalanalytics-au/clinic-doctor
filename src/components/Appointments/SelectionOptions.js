/**
 * Dashboard -> Appointments -> SelectionOptions
 * Dropdown list for display of selected options in appointment list (Month/Year and All/Today's Appointments)
 */

import { useContext, useEffect, useState } from "react"
import "../../App.css"
import PropTypes from "prop-types"
import { DateTime } from "luxon"

// material ui
import { TextField, MenuItem } from "@mui/material"

// constants
import { months } from "../../utils/constants"

// context
import { ProfileContext } from "../../App"
import { VIEW_ALL_ACTIVE, VIEW_UNCLOSED_CONSULTATIONS } from "../../utils/context"

const SelectionOptions = (props) => {
	const { state } = useContext(ProfileContext)

	// TODO: change mobile props to use useResponsiveMedia() hook locally
	const { mobile, appointmentView, monthView, yearView, monthViewChange, yearViewChange, appointmentViewChange } = props

	const [appointmentViewOption, setAppointmentViewOption] = useState(appointmentView || "all") // applicable for "View Active Appointments" (view Today's or All)

	const [monthViewOption, setMonthViewOption] = useState(VIEW_ALL_ACTIVE)
	const [yearViewOption, setYearViewOption] = useState(yearView || DateTime.now().year.toString())

	const monthsSelectionList = [VIEW_UNCLOSED_CONSULTATIONS, VIEW_ALL_ACTIVE, ...months]

	useEffect(() => {
		setMonthViewOption(monthView)
		setYearViewOption(yearView)
	}, [monthView, yearView])

	const changeMonthViewOption = (e) => {
		setMonthViewOption(e.target.value)
		monthViewChange && monthViewChange(e.target.value)
	}

	const changeYearViewOption = (e) => {
		setYearViewOption(e.target.value)
		yearViewChange && yearViewChange(e.target.value)
	}

	const changeAppointmentViewOption = (e) => {
		setAppointmentViewOption(e.target.value)
		appointmentViewChange && appointmentViewChange(e.target.value)
	}

	const styles = {
		...subStyles,
		mainContainer: {
			...supportStyles.mainContainer,
			flexDirection: mobile ? "column" : "row",
		},
		selectViewMobileCaption: {
			...supportStyles.selectViewMobileCaption,
			display: mobile ? "flex" : "none",
		},
		monthViewList: {
			...supportStyles.monthViewList,
			width: mobile ? "300px" : "250px",
		},
		yearViewList: {
			...supportStyles.yearViewList,
			width: mobile ? "300px" : "auto",
		},
	}
	return (
		<div style={styles.mainContainer}>
			<div style={styles.selectViewMobileCaption}>Select View</div>

			<TextField select value={monthViewOption} onChange={changeMonthViewOption} size="small" style={styles.monthViewList}>
				{monthsSelectionList.map((i) => {
					return (
						<MenuItem key={i} value={i}>
							{i}
						</MenuItem>
					)
				})}
			</TextField>

			<TextField
				select
				value={yearViewOption}
				disabled={monthViewOption === VIEW_ALL_ACTIVE}
				onChange={changeYearViewOption}
				size="small"
				style={styles.yearViewList}
			>
				{state.historicalYearList.map((i) => {
					return (
						<MenuItem key={i} value={i}>
							{i}
						</MenuItem>
					)
				})}
			</TextField>

			<TextField
				select
				value={appointmentViewOption}
				disabled={monthViewOption !== VIEW_ALL_ACTIVE}
				style={styles.appointmentViewOptionList}
				onChange={changeAppointmentViewOption}
				size="small"
			>
				<MenuItem value="all">Show All Appointments</MenuItem>
				<MenuItem value="today">Show Today's Appointments</MenuItem>
			</TextField>
		</div>
	)
}

SelectionOptions.propTypes = {
	mobile: PropTypes.bool, // TODO: change to use useResponsiveMedia() hook locally

	appointmentViewOption: PropTypes.string,
	monthViewOption: PropTypes.string,
	yearViewOption: PropTypes.string,

	appointmentViewChange: PropTypes.func,
	monthViewChange: PropTypes.func,
	yearViewChange: PropTypes.func,
}

const supportStyles = {
	mainContainer: { display: "flex" },
	selectViewMobileCaption: { fontWeight: "bold", marginBottom: "10px" },
	monthViewList: { marginRight: "10px", marginBottom: "10px" },
	yearViewList: { marginRight: "10px", marginBottom: "10px" },
}

const subStyles = {
	appointmentViewOptionList: { marginRight: "10px", width: "300px", marginBottom: "10px" },
}
export default SelectionOptions
