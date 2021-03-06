import React from 'react'
import { LogCategory } from "../Controller/Common";

class AutoScroll extends React.Component {
	constructor(props) {
		super(props);
		this.myRef = React.createRef();
	}
	componentDidMount() {
		this.scroll();
	}
	scroll() {
		let cur = this.myRef.current;
		if (cur) {
			this.myRef.current.scrollTop = this.myRef.current.scrollHeight;
		}
	}
	componentDidUpdate() {
		this.scroll();
	}
	render() {
		return(<div ref={this.myRef} className={this.props.className}>{this.props.content}</div>);
	}
}

let logContent = new Map();
logContent.set(LogCategory.Action, []);
logContent.set(LogCategory.Event, []);

let addLogContentInner = function(logCategory, newContent, color) {
	logContent.get(logCategory).push({
		text: newContent,
		color: color
	});
}
export let addLogContent = addLogContentInner;

class LogView extends React.Component {
	constructor(props) {
		super(props);
		addLogContent = ((logCategory, newContent, color)=>{
			addLogContentInner(logCategory, newContent, color);
			this.forceUpdate();
		}).bind(this);
	}
	componentWillUnmount() {
		addLogContent = addLogContentInner;
	}
	render() {
		let mappedContent = function(category) {
			let list = logContent.get(category);
			let outList = [];
			for (let i=0; i<list.length; i++) {
				let entry = list[i];
				outList.push(<div key={i} className={entry.color + " logEntry"}>{entry.text}</div>)
			}
			return outList;
		}
		return(<div className={"logsAll"}>
			<AutoScroll className={"logWindow actions"} key={0} name={LogCategory.Action} content={mappedContent(LogCategory.Action)}/>
			<AutoScroll className={"logWindow events"} key={1} name={LogCategory.Event} content={mappedContent(LogCategory.Event)}/>
		</div>);
	}
}
export const logView = <LogView />;