import React from 'react'
import {Clickable, Expandable, Input, LoadJsonFromFileOrUrl, saveToFile} from "./Common";
import {controller} from "../Controller/Controller";
import {FileType, ReplayMode} from "../Controller/Common";
import {skillIcons} from "./Skills";
import {ActionType} from "../Controller/Record";

export let updateSkillSequencePresetsView = ()=>{};

class SaveAsPreset extends React.Component {
	constructor(props) {
		super(props);
		this.onChange = ((val)=>{
			this.setState({filename: val});
		}).bind(this);

		this.state = {
			filename: "(untitled)"
		};
	}
	render() {
		return <form>
			<Input
				style={{display: "inline-block", marginTop: "10px"}}
				defaultValue={this.state.filename}
				description={"name: "} width={30}
				onChange={this.onChange}/>
			<span> </span>
			<button type={"submit"} disabled={!this.props.enabled} onClick={(e) => {
				controller.addSelectionToPreset(this.state.filename);
				e.preventDefault();
			}}>add selection to preset
			</button>
		</form>
	}
}

function PresetLine(props) {
	let line = props.line;
	let icons = [];
	let itr = line.getFirstAction();
	let ctr = 0;
	let iconStyle = {
		margin: "0 1px",
		width: "18px",
		verticalAlign: "middle"
	}
	while (itr) {
		console.assert(itr.type === ActionType.Skill);
		let iconPath = skillIcons.get(itr.skillName);
		icons.push(<img style={iconStyle} key={ctr} src={iconPath} alt={itr.skillName}/>)
		itr = itr.next; ctr++;
	}
	let clickableContent = <span>{line.name} ({icons})</span>;

	let addLineStyle = controller.displayingUpToDateGameState ? {} : {
		//filter: "grayscale(100%)",
		//pointerEvents: "none",
		cursor: "not-allowed"
	};
	return <div style={{marginBottom: "8px"}}>
		<Clickable content={clickableContent} style={addLineStyle} onClickFn={controller.displayingUpToDateGameState ? (() => {
			controller.tryAddLine(line, ReplayMode.Tight);
			controller.updateAllDisplay();
			controller.scrollToTime();
		}) : undefined}/>
		<span> </span>
		<Clickable content="[x]" onClickFn={() => {
			controller.deleteLine(line);
		}}/>
	</div>
}

class SkillSequencePresets extends React.Component {
	saveFilename = "presets.txt";
	constructor(props) {
		super(props);
		updateSkillSequencePresetsView = this.unboundUpdatePresetsView.bind(this);
		this.onSaveFilenameChange = this.unboundOnSaveFilenameChange.bind(this);
		this.onSave = this.unboundOnSave.bind(this);
	}
	componentWillUnmount() {
		updateSkillSequencePresetsView = ()=>{};
	}
	unboundOnSaveFilenameChange(evt) {
		if (evt.target) this.saveFilename = evt.target.value;
	}
	unboundOnSave(e) {
		saveToFile(controller.serializedPresets(), this.saveFilename);
	}
	unboundUpdatePresetsView() { this.forceUpdate(); }
	render() {
		let hasSelection = controller && controller.record && controller.record.getFirstSelection();
		let contentStyle = {
			margin: "10px",
			paddingLeft: "10px",
		};
		let longInputStyle = {
			outline: "none",
			border: "none",
			borderBottom: "1px solid black",
			width: "20em",
		};
		let content = <div style={contentStyle}>
			<button style={{marginBottom: 10}} onClick={()=>{
				controller.deleteAllLines();
			}}>clear all presets</button>
			<LoadJsonFromFileOrUrl
				loadUrlOnMount={false}
				defaultLoadUrl={"https://miyehn.me/ffxiv-blm-rotation/presets/lines/default.txt"}
				onLoadFn={(content)=>{
					if (content.fileType === FileType.SkillSequencePresets) {
						controller.appendFilePresets(content);
					} else {
						window.alert("incorrect file type '" + content.fileType + "'");
					}
				}}/>
			<div style={{
				outline: "1px solid lightgrey",
				margin: "10px 0",
				padding: "10px",
			}}>
				{controller.getPresetLines().map((line)=>{
					return <PresetLine line={line} key={line._lineIndex}/>
				})}
				<SaveAsPreset enabled={hasSelection}/>
				<form style={{marginTop: "16px"}}>
					<span>Save presets to file as: </span>
					<input defaultValue={this.saveFilename} style={longInputStyle} onChange={this.onSaveFilenameChange}/>
					<span> </span>
					<button type={"submit"} onClick={(e)=>{
						this.onSave();
						e.preventDefault();
					}}>save</button>
				</form>
			</div>
		</div>;
		return <Expandable
			title="Skill sequence presets"
			content={content}
			defaultShow={false}/>
	}
}

export let skillSequencePresets = <SkillSequencePresets/>;