type AkOperatorInfo = {
	name: string,
	color: string,
	redeploy: number,
	initialAbilityPt: number,
	abilityCd: number,
	abilityDuration: number
}

const akOperatorDefs = new Map<string, Omit<AkOperatorInfo, "name">>([
	[
		"伊内丝",
		{
			color: "#b50909",
			redeploy: 35,
			initialAbilityPt: 15,
			abilityCd: 20,
			abilityDuration: 12
		},
	],
	[
		"铃兰",
		{
			color: "#f3d043",
			redeploy: 70,
			initialAbilityPt: 50,
			abilityCd: 70,
			abilityDuration: 35
		},
	]
]);

export type AkOperatorState = "OP_READY" | "OP_DEPLOYED" | "ABILITY_READY" | "ABILITY" | "OP_COOLDOWN";
export type AkOperatorAction = "DEPLOY" | "ABILITY_START" | "ABILITY_STOP" | "LEAVE";

// really just a fancy timeline marker
export class AkOperator {

	track: number;
	info: AkOperatorInfo;
	actions: {
		time: number,
		action: AkOperatorAction
	}[];

	constructor(track: number, info: AkOperatorInfo) {
		this.track = track;
		this.info = info;
		this.actions = [];
	}

	getState(t: number): AkOperatorState {
		let state: AkOperatorState = "OP_READY";
		for (let i = 0; i < this.actions.length; i++) {
			if (this.actions[i].time > t) break;
			switch (this.actions[i].action) {
				case "DEPLOY": {
					if (t - this.actions[i].time > this.info.abilityCd - this.info.initialAbilityPt) {
						state = "ABILITY_READY";
					} else {
						state = "OP_DEPLOYED";
					}
					break;
				}
				case "ABILITY_START": {
					if (t - this.actions[i].time > this.info.abilityDuration) {
						state = "OP_DEPLOYED";
					} else {
						state = "ABILITY";
					}
					break;
				}
				case "ABILITY_STOP": {
					if (t - this.actions[i].time > this.info.abilityCd) {
						state = "ABILITY_READY";
					} else {
						state = "OP_DEPLOYED";
					}
					break;
				}
				case "LEAVE": {
					if (t - this.actions[i].time > this.info.redeploy) {
						state = "OP_READY";
					} else {
						state = "OP_COOLDOWN";
					}
				}
			}
		}
		return state;
	}

	getAvailableActions(t: number): AkOperatorAction[] {
		const currentState = this.getState(t);
		switch (currentState) {
			case "OP_READY": {
				return ["DEPLOY"]
			}
			case "OP_DEPLOYED": {
				return ["LEAVE"]
			}
			case "ABILITY_READY": {
				return ["ABILITY_START", "LEAVE"]
			}
			case "ABILITY": {
				return ["ABILITY_STOP", "LEAVE"]
			}
			case "OP_COOLDOWN": {
				return []
			}
		}
	}

	serialized(): string {
		let str = `${this.track} ${this.info.name}`;
		this.actions.forEach((action) => {
			str += `\n${action.time} ${action.action}`;
		});
		return str;
	}

	static parse(str: string): AkOperator {
		const lines = str.split("\n");
		const getTokens = function(line: string) {
			return line.split(" ").filter(tok => { return tok.length > 0; }).map(tok => tok.trim());
		}
		const firstLine = getTokens(lines[0]);
		const track = parseInt(firstLine[0]);
		const name = firstLine[1];
		const info: AkOperatorInfo = {
			name,
			...akOperatorDefs.get(name)!
		};

		const operator = new AkOperator(track, info);
		for (let i = 1; i < lines.length; i++) {
			const tokens = getTokens(lines[i]);
			operator.actions.push({
				time: parseFloat(tokens[0]),
				action: tokens[1].toUpperCase() as AkOperatorAction,
			});
		}

		return operator;
	}

	// an operator will get drawn onto a marker track (an operator is just a very complicated marker)
}