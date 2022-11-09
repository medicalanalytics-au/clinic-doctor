/**
 * Dashboard -> Appointments -> TimerBox
 * Countdown timer to appointment/end of appointment displayed on <Row/>
 */

import { useEffect, useState } from "react"
import "../../App.css"
import PropTypes from "prop-types"
import Countdown from "react-countdown"

// custom functions
import { now, renderer } from "../../utils/helpers"

const TimerBox = (props) => {
	const [key, setKey] = useState()

	const { data, inSessionLabel } = props

	const _now = now()

	useEffect(() => {
		setKey(!data.status ? data.startTime : data.endTime)
	}, [data.startTime, data.status, data.endTime])

	return (
		<div>
			{data.endTime < now() ? (
				<div>completed</div>
			) : (
				<>
					<div style={{ fontSize: "8px" }}>
						{_now < data.startTime ? "Starting in" : _now < data.endTime ? inSessionLabel || "Ending in" : "completed"}
					</div>
					<div style={{ fontSize: "12px" }}>
						<Countdown
							date={key}
							key={key}
							onComplete={() => {
								props.onCycleChange && props.onCycleChange(!data.status ? "start" : "end")

								// * if not completed, restart timer to countdown to end time
								!data.status && setKey(data.endTime)
							}}
							renderer={renderer}
							onTick={(res) => {
								props.timeTriggers.includes(res.total) && props.onTimeTrigger && props.onTimeTrigger(res.total)
							}}
						/>
					</div>
				</>
			)}
		</div>
	)
}

TimerBox.propTypes = {
	data: PropTypes.object,
	inSessionLabel: PropTypes.string,
	onCycleChange: PropTypes.func,
	timeTriggers: PropTypes.array,
	onTimeTrigger: PropTypes.func,
}

const Timer = (props) => {
	return (
		<div style={{ display: "flex", flexDirection: "column" }}>
			<TimerBox
				data={props.data}
				inSessionLabel={props.inSessionLabel}
				timeTriggers={props.timeTriggers || []} // TODO CHECK
				onCycleChange={(res) => props.onCycleChange && props.onCycleChange(res)}
			/>
		</div>
	)
}

Timer.propTypes = {
	data: PropTypes.object,
	inSessionLabel: PropTypes.string,
	onCycleChange: PropTypes.func,
	timeTriggers: PropTypes.array, // TODO CHECK
	onTimeTrigger: PropTypes.func, // TODO CHECK
}

export default Timer
