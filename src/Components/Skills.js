import React from 'react'
import {ButtonIndicator, Clickable} from "./Common";
import {ResourceType, SkillName, SkillReadyStatus} from "../Game/Common";
import {controller} from "../Controller/Controller";
import ReactTooltip from 'react-tooltip';

export let displayedSkills = [
	SkillName.Blizzard,
	SkillName.Fire,
	SkillName.Transpose,
	SkillName.Thunder3,
	SkillName.Manaward,
	SkillName.Manafont,
	SkillName.Fire3,
	SkillName.Blizzard3,
	SkillName.Freeze,
	SkillName.Flare,
	SkillName.LeyLines,
	SkillName.Sharpcast,
	SkillName.Blizzard4,
	SkillName.Fire4,
	SkillName.BetweenTheLines,
	SkillName.AetherialManipulation,
	SkillName.Triplecast,
	SkillName.Foul,
	SkillName.Despair,
	SkillName.UmbralSoul,
	SkillName.Xenoglossy,
	SkillName.HighFire2,
	SkillName.HighBlizzard2,
	SkillName.Amplifier,
	//SkillName.Paradox, // display paradox at F1/B1
	SkillName.Addle,
	SkillName.Swiftcast,
	SkillName.LucidDreaming,
	SkillName.Surecast,
	SkillName.Tincture
];

export const skillIcons = new Map();
skillIcons.set(SkillName.Blizzard, require("./Asset/blizzard.png"));
skillIcons.set(SkillName.Fire, require("./Asset/fire.png"));
skillIcons.set(SkillName.Transpose, require("./Asset/transpose.png"));
skillIcons.set(SkillName.Thunder3, require("./Asset/thunder3.png"));
skillIcons.set(SkillName.Manaward, require("./Asset/manaward.png"));
skillIcons.set(SkillName.Manafont, require("./Asset/manafont.png"));
skillIcons.set(SkillName.Fire3, require("./Asset/fire3.png"));
skillIcons.set(SkillName.Blizzard3, require("./Asset/blizzard3.png"));
skillIcons.set(SkillName.Freeze, require("./Asset/freeze.png"));
skillIcons.set(SkillName.AetherialManipulation, require("./Asset/aetherialManipulation.png"));
skillIcons.set(SkillName.Flare, require("./Asset/flare.png"));
skillIcons.set(SkillName.LeyLines, require("./Asset/leyLines.png"));
skillIcons.set(SkillName.Sharpcast, require("./Asset/sharpcast.png"));
skillIcons.set(SkillName.Blizzard4, require("./Asset/blizzard4.png"));
skillIcons.set(SkillName.Fire4, require("./Asset/fire4.png"));
skillIcons.set(SkillName.BetweenTheLines, require("./Asset/betweenTheLines.png"));
skillIcons.set(SkillName.Triplecast, require("./Asset/triplecast.png"));
skillIcons.set(SkillName.Foul, require("./Asset/foul.png"));
skillIcons.set(SkillName.Despair, require("./Asset/despair.png"));
skillIcons.set(SkillName.UmbralSoul, require("./Asset/umbralSoul.png"));
skillIcons.set(SkillName.Xenoglossy, require("./Asset/xenoglossy.png"));
skillIcons.set(SkillName.HighFire2, require("./Asset/highFire2.png"));
skillIcons.set(SkillName.HighBlizzard2, require("./Asset/highBlizzard2.png"));
skillIcons.set(SkillName.Amplifier, require("./Asset/amplifier.png"));
skillIcons.set(SkillName.Paradox, require("./Asset/paradox.png"));
skillIcons.set(SkillName.Addle, require("./Asset/addle.png"));
skillIcons.set(SkillName.Swiftcast, require("./Asset/swiftcast.png"));
skillIcons.set(SkillName.LucidDreaming, require("./Asset/lucidDreaming.png"));
skillIcons.set(SkillName.Surecast, require("./Asset/surecast.png"));
skillIcons.set(SkillName.Tincture, require("./Asset/tincture.png"));

let setSkillInfoText = (text)=>{};
function ProgressCircle(props={
	className: "",
	diameter: 50,
	progress: 0.7,
	color: "rgba(255,255,255,0.5)",
}) {
	let elemRadius = props.diameter / 2.0;
	let outRadius = props.diameter * 0.35;
	let outCircumference = 2 * Math.PI * outRadius;
	let outFillLength = outCircumference * props.progress;
	let outGapLength = outCircumference - outFillLength;
	let outDasharray = outFillLength + "," + outGapLength;
	let outlineCircle = <circle
		r={outRadius}
		cx={elemRadius}
		cy={elemRadius}
		fill="none"
		stroke={props.color}
		strokeWidth="6"
		strokeDasharray={outDasharray}
		strokeDashoffset={outCircumference / 4}/>

	return <svg className={props.className} width={props.diameter} height={props.diameter}>
		{outlineCircle}
	</svg>
}

class SkillButton extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			skillDescription: <div/>
		};
		this.handleMouseEnter = ((evt)=>{
			let info = controller.getSkillInfo({
				game: controller.getDisplayedGame(),
				skillName: this.props.skillName
			});

			let s = "";
			if (info.status === SkillReadyStatus.Ready) {
				s += "ready (" + info.stacksAvailable + " stack";
				if (info.stacksAvailable > 1) s += "s";
				s += ")";
			}
			else if (info.status === SkillReadyStatus.RequirementsNotMet) {
				s += " skill requirement(s) not satisfied";
			} else if (info.status === SkillReadyStatus.NotEnoughMP) {
				s += " not enough MP (needs " + info.capturedManaCost + ")";
			} else if (info.status === SkillReadyStatus.Blocked) {
				s += "possibly ready in " + info.timeTillAvailable.toFixed(2) + " (CD ready in " + info.cdReadyCountdown.toFixed(2) + ")";
			}
			let content = <div style={{color: controller.displayingUpToDateGameState ? "white" : "darkorange"}}>
				<div className="paragraph">{this.props.skillName}</div>
				<div className="paragraph">{s}</div>
			</div>;
			setSkillInfoText(content);
			this.setState({skillDescription: content});
		}).bind(this);
	}
	render() {
		let iconPath = skillIcons.get(this.props.skillName);
		let icon = <div onMouseEnter={this.handleMouseEnter} className={"skillIcon" + (this.props.ready ? "" : " notReady")}><img src={iconPath} alt={this.props.skillName}/></div>;
		let progressCircle = <ProgressCircle className="cdProgress" diameter={40} progress={this.props.cdProgress} color={"rgba(255,255,255,0.7)"}/>;
		return <span title={this.skillName} className={"skillButton"} data-tip data-for={"skillButton-" + this.props.skillName}>
			{this.props.cdProgress === 1 ? "" : progressCircle}
			<Clickable onClickFn={controller.displayingUpToDateGameState ? ()=>{
				controller.requestUseSkill({skillName: this.props.skillName});
				controller.updateAllDisplay();
			} : undefined} content={icon} style={controller.displayingUpToDateGameState ? {} : { cursor: "not-allowed" }}/>
			<ReactTooltip id={"skillButton-" + this.props.skillName}>
				{this.state.skillDescription}
			</ReactTooltip>
		</span>
	}
}

export var updateSkillButtons = (statusList)=>{}
class SkillsWindow extends React.Component {
	constructor(props) {
		super(props);
		updateSkillButtons = ((statusList)=>{
			this.setState({
				statusList: statusList,
				paradoxInfo: controller.getSkillInfo({game: controller.getDisplayedGame(), skillName: SkillName.Paradox}),
			});
		}).bind(this);

		setSkillInfoText = ((text)=>{
			this.setState({tooltipContent: text});
		}).bind(this);

		this.onWaitTimeChange = ((e)=>{
			if (!e || !e.target) return;
			this.setState({waitTime: e.target.value});
		}).bind(this);

		this.onWaitTimeSubmit = ((e)=>{
			let numVal = parseFloat(this.state.waitTime);
			if (!isNaN(numVal)) {
				controller.step(numVal);
			}
			e.preventDefault();
		}).bind(this);

		this.state = {
			statusList: undefined,
			paradoxInfo: undefined,
			tooltipContent: "",
			waitTime: "1"
		}
	}
	componentDidMount() {
		this.setState({
			statusList: displayedSkills.map(sn=>{
				return controller.getSkillInfo({game: controller.getDisplayedGame(), skillName: sn});
			}),
			paradoxInfo: controller.getSkillInfo({game: controller.getDisplayedGame(), skillName: SkillName.Paradox}),
		});
	}

	render() {
		let skillButtons = [];
		let para = controller.getResourceValue({rscType: ResourceType.Paradox});
		for (let i = 0; i < displayedSkills.length; i++) {
			let isF1B1 = displayedSkills[i] === SkillName.Fire || displayedSkills[i] === SkillName.Blizzard;
			let skillName = (isF1B1 && para) ? SkillName.Paradox : displayedSkills[i];
			let info = undefined;
			if (this.state.paradoxInfo) info = (isF1B1 && para) ? this.state.paradoxInfo : this.state.statusList[i];
			let btn = <SkillButton
				key={i}
				skillName={skillName}
				ready={info ? info.status===SkillReadyStatus.Ready : false}
				cdProgress={info ? 1 - info.cdReadyCountdown / info.cdRecastTime : 1}
				/>
			skillButtons.push(btn);
		}

		return <div className={"skillsWindow"}>
			<div data-tip data-for="SkillDescription" className={"skillIcons"}>
				{skillButtons}
				<form onSubmit={this.onWaitTimeSubmit} style={{margin: "10px 0"}}>
					Wait for <input type={"text"} style={{
						width: 40, outline: "none", border: "none", borderBottom: "1px solid black", borderRadius: 0
					}} value={this.state.waitTime} onChange={this.onWaitTimeChange}/> second(s) <input type="submit" disabled={!controller.displayingUpToDateGameState} value="GO"/>
				</form>
			</div>
		</div>
	}
}

export const skillsWindow = <SkillsWindow />;
