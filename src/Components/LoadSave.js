import React from 'react'
import {loadFromFile, saveToFile} from "./Common";
import {controller} from "../Controller/Controller";
import {FileType} from "../Controller/Common";

export class LoadSave extends React.Component {
	constructor(props) {
		super(props);

		this.onLoad = (()=>{
			let cur = this.fileSelectorRef.current;
			if (cur && cur.files.length > 0) {
				let fileToLoad = cur.files[0];
				loadFromFile(fileToLoad, (content)=>{
					if (content.fileType === FileType.Record) {
						controller.loadBattleRecordFromFile(content);
						controller.updateAllDisplay();
						controller.autoSave();
					} else {
						window.alert("wrong file type '" + content.fileType + "'.");
					}
				});
				cur.value = "";
			}
		}).bind(this);

		this.onSave = (()=>{
			saveToFile(controller.record.serialized(), this.saveFilename);
		}).bind(this);

		this.onSaveFilenameChange = ((e)=>{
			if (e.target) {
				this.saveFilename = e.target.value;
			}
		}).bind(this);

		this.fileSelectorRef = React.createRef();
		this.saveFilename = "fight.txt";
	}
	render() {
		return <div className={"loadSave"}>
			<div>
				<input defaultValue="fight.txt" className="textInput" width="4" onChange={this.onSaveFilenameChange}/>
				<span> </span>
				<button onClick={this.onSave}>save to file</button>
			</div>
			<div>
				<span>Load from: </span>
				<input
					style={{
						width: "110px",
						color: "transparent"
					}}
					type="file"
					ref={this.fileSelectorRef}
					onChange={this.onLoad}/>
			</div>
		</div>
	}
}