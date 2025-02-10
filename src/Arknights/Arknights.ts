import { getCachedValue, setCachedValue } from "../Controller/Common";
import { updateTimelineView } from "../Components/Timeline";

type AkOperatorInfo = {
	name: string;
	color: string;
	redeploy: number;
	initialAbilityPt: number;
	abilityCd: number;
	abilityDuration: number;
};

const akOperatorDefs = new Map<string, Omit<AkOperatorInfo, "name">>([
	[
		"伊内丝",
		{
			color: "#b50909",
			redeploy: 35,
			initialAbilityPt: 15,
			abilityCd: 20,
			abilityDuration: 12,
		},
	],
	[
		"铃兰",
		{
			color: "#f3d043",
			redeploy: 70,
			initialAbilityPt: 50,
			abilityCd: 70,
			abilityDuration: 35,
		},
	],
]);

export type AkOperatorState =
	| "OP_READY"
	| "OP_DEPLOYED"
	| "ABILITY_READY"
	| "ABILITY"
	| "OP_COOLDOWN";
export type AkOperatorAction = "DEPLOY" | "ABILITY_START" | "ABILITY_STOP" | "LEAVE";

// really just a fancy timeline marker
export class AkOperator {
	track: number;
	info: AkOperatorInfo;
	actions: {
		time: number;
		action: AkOperatorAction;
	}[];

	constructor(track: number, info: AkOperatorInfo) {
		this.track = track;
		this.info = info;
		this.actions = [];
	}

	getState(t: number): AkOperatorState {
		const eps = 1e-6;
		let state: AkOperatorState = "OP_READY";
		for (let i = 0; i < this.actions.length; i++) {
			if (this.actions[i].time > t) break;
			switch (this.actions[i].action) {
				case "DEPLOY": {
					if (
						t - this.actions[i].time >=
						this.info.abilityCd - this.info.initialAbilityPt - eps
					) {
						state = "ABILITY_READY";
					} else {
						state = "OP_DEPLOYED";
					}
					break;
				}
				case "ABILITY_START": {
					if (
						t - this.actions[i].time >=
						this.info.abilityDuration + this.info.abilityCd - eps
					) {
						state = "ABILITY_READY";
					} else if (t - this.actions[i].time >= this.info.abilityDuration - eps) {
						state = "OP_DEPLOYED";
					} else {
						state = "ABILITY";
					}
					break;
				}
				case "ABILITY_STOP": {
					if (t - this.actions[i].time >= this.info.abilityCd - eps) {
						state = "ABILITY_READY";
					} else {
						state = "OP_DEPLOYED";
					}
					break;
				}
				case "LEAVE": {
					if (t - this.actions[i].time >= this.info.redeploy - eps) {
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
				return ["DEPLOY"];
			}
			case "OP_DEPLOYED": {
				return ["LEAVE"];
			}
			case "ABILITY_READY": {
				return ["ABILITY_START", "LEAVE"];
			}
			case "ABILITY": {
				return ["ABILITY_STOP", "LEAVE"];
			}
			case "OP_COOLDOWN": {
				return [];
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

	static parse(str: string): AkOperator | undefined {
		const getTokens = function (line: string) {
			return line
				.split(" ")
				.map((tok) => tok.trim())
				.filter((tok) => tok.length > 0);
		};
		const lines = str
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => line.length > 0)
			.map((line) => getTokens(line));

		if (lines.length === 0 || lines[0].length !== 2) return undefined;

		const track = parseInt(lines[0][0]);
		const name = lines[0][1];

		if (isNaN(track) || !akOperatorDefs.has(name)) return undefined;

		const info: AkOperatorInfo = {
			name,
			...akOperatorDefs.get(name)!,
		};

		const operator = new AkOperator(track, info);
		for (let i = 1; i < lines.length; i++) {
			const tokens = lines[i];
			if (tokens.length !== 2) return undefined;

			const time = parseFloat(tokens[0]);
			const action = tokens[1].toUpperCase() as AkOperatorAction;
			if (isNaN(time)) return undefined;
			if (!operator.getAvailableActions(time).includes(action)) return undefined;

			operator.actions.push({
				time,
				action,
			});
		}

		return operator;
	}

	// an operator will get drawn onto a marker track (an operator is just a very complicated marker)
}

class AkStateManager {
	readonly #operators: Map<string, AkOperator>;
	constructor() {
		this.#operators = new Map();
		this.#load();
	}

	addOperator(operator: AkOperator) {
		this.#operators.set(operator.info.name, operator);
		updateTimelineView();
		this.#save();
	}

	removeOperator(name: string) {
		if (this.#operators.has(name)) {
			this.#operators.delete(name);
			updateTimelineView();
			this.#save();
		}
	}

	getMaxTrack() {
		let maxTrack = -1;
		this.#operators.forEach((operator) => {
			maxTrack = Math.max(maxTrack, operator.track);
		});
		return maxTrack;
	}

	getOperators() {
		return Array.from(this.#operators.values());
	}

	#load() {
		let str = getCachedValue("akOperators");
		if (str !== null) {
			let ops = JSON.parse(str);
			ops.forEach((op: any) => {
				const operator = AkOperator.parse(op)!;
				this.#operators.set(operator.info.name, operator);
			});
		}
	}

	#save() {
		let serializedOperators = Array.from(this.#operators.values()).map((op) => op.serialized());
		setCachedValue("akOperators", JSON.stringify(serializedOperators));
	}
}

export const akStateManager = new AkStateManager();
