import "../../App.css"
import PropTypes from "prop-types"
import { Fade, IconButton, InputAdornment, TextField, Tooltip } from "@mui/material"
import React, {  useRef, useState } from "react"
import { RiSearchLine } from "react-icons/ri"
import { IoCloseCircleOutline } from "react-icons/io5"

const SearchBar = (props) => {
	const [editboxOpen, setEditBoxOpen] = useState(false)
	const [searchVal, setSearchVal] = useState("")

	const inputRef = useRef()
	const boxRef = useRef()

	return (
		<div ref={boxRef} style={{ display: "flex", flexDirection: "row" }}>
			<Fade in={editboxOpen}>
				<TextField
					inputRef={inputRef}
					size="small"
					value={searchVal}
					onChange={(e) => {
						setSearchVal(e.target.value)
						props.onChange(e.target.value)
					}}
					autoFocus
					autoCapitalize="none"
					label="Patient's name"
					autoComplete={"off"}
					onBlur={() => searchVal.length === 0 && setEditBoxOpen(false)} // hide search box when lost focus
					InputProps={{
						endAdornment: (
							<InputAdornment position="end">
								<IoCloseCircleOutline
									style={{ color: "silver", cursor: "pointer" }}
									onClick={() => {
										setSearchVal("")
										props.onChange("")
										inputRef.current && inputRef.current.focus()
									}}
								/>
							</InputAdornment>
						),
					}}
				/>
			</Fade>
			{!editboxOpen && (
				<Tooltip title="Search">
					<IconButton onClick={() => setEditBoxOpen((editboxOpen) => !editboxOpen)}>
						<RiSearchLine />
					</IconButton>
				</Tooltip>
			)}
		</div>
	)
}

SearchBar.propTypes = {
	onChange: PropTypes.func,
}

export default SearchBar
