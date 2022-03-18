import { SkillName, ResourceType, Aspect } from './Common'
import { controller } from "../Controller/Controller";
import { LogCategory, Color } from "../Controller/Common";

class SkillInfo
{
	constructor(skillName, cdName, aspect, isSpell, baseCastTime, baseManaCost, basePotency, skillApplicationDelay)
	{
		this.name = skillName;
		this.cdName = cdName;
		this.aspect = aspect;
		this.isSpell = isSpell;
		this.baseCastTime = baseCastTime;
		this.baseManaCost = baseManaCost;
		this.basePotency = basePotency;
		this.skillApplicationDelay = skillApplicationDelay;
	}
}

// SHOULD NEVER MODIFY THIS LIST DFSODGHSIPJF
const skillInfos = [
	new SkillInfo(SkillName.Blizzard, ResourceType.cd_GCD, Aspect.Ice, true,
		2.5, 400, 180, 0.846),
	new SkillInfo(SkillName.Fire, ResourceType.cd_GCD, Aspect.Fire, true,
		2.5, 800, 180, 1.871),
	new SkillInfo(SkillName.Transpose, ResourceType.cd_Transpose, Aspect.Other, false,
		0, 0, 0, 0.1),
	new SkillInfo(SkillName.Thunder3, ResourceType.cd_GCD, Aspect.Lightning, true,
		2.5, 400, 50, 1.025),
	new SkillInfo(SkillName.Manaward, ResourceType.cd_Manaward, Aspect.Other, false,
		0, 0, 0, 0.1),
	new SkillInfo(SkillName.Manafont, ResourceType.cd_Manafont, Aspect.Other, false,
		0, 0, 0, 0.1),
	new SkillInfo(SkillName.Fire3, ResourceType.cd_GCD, Aspect.Fire, true,
		3.5, 2000, 260, 1.292),
	new SkillInfo(SkillName.Blizzard3, ResourceType.cd_GCD, Aspect.Ice, true,
		3.5, 800, 260, 0.89),
	new SkillInfo(SkillName.Freeze, ResourceType.cd_GCD, Aspect.Ice, true,
		2.8, 1000, 120, 0.664),
	new SkillInfo(SkillName.Flare, ResourceType.cd_GCD, Aspect.Fire, true,
		4, 0, 280, 1.157), // mana is handled separately

	new SkillInfo(SkillName.LeyLines, ResourceType.cd_LeyLines, Aspect.Other, false,
		0, 0, 0, 0.1),
	new SkillInfo(SkillName.Sharpcast, ResourceType.cd_Sharpcast, Aspect.Other,false,
		0, 0, 0, 0.1),
	new SkillInfo(SkillName.Blizzard4, ResourceType.cd_GCD, Aspect.Ice, true,
		2.5, 800, 300, 1.156),
	new SkillInfo(SkillName.Fire4, ResourceType.cd_GCD, Aspect.Fire, true,
		2.8, 800, 300, 1.159),
	new SkillInfo(SkillName.BetweenTheLines, ResourceType.cd_BetweenTheLines, Aspect.Other, false,
		0, 0, 0, 0.1),
	new SkillInfo(SkillName.AetherialManipulation, ResourceType.cd_AetherialManipulation, Aspect.Other, false,
		0, 0, 0, 0.1),
	//new SkillInfo(SkillName.Thunder4, ResourceType.cd_GCD, Aspect.Lightning, true, 2.5, 400, 50, 0.1),
	new SkillInfo(SkillName.Triplecast, ResourceType.cd_Triplecast, Aspect.Other, false,
		0, 0, 0, 0.1),

	new SkillInfo(SkillName.Foul, ResourceType.cd_GCD, Aspect.Other, true,
		0, 0, 560, 1.158),
	new SkillInfo(SkillName.Despair, ResourceType.cd_GCD, Aspect.Fire, true,
		3, 0, 340, 0.056),
	new SkillInfo(SkillName.UmbralSoul, ResourceType.cd_GCD, Aspect.Ice, true,
		0, 0, 0, 0.1),
	new SkillInfo(SkillName.Xenoglossy, ResourceType.cd_GCD, Aspect.Other, true,
		0, 0, 760, 0.63),

	new SkillInfo(SkillName.HighFire2, ResourceType.cd_GCD, Aspect.Fire, true,
		3, 1500, 140, 1.154),
	new SkillInfo(SkillName.HighBlizzard2, ResourceType.cd_GCD, Aspect.Ice, true,
		3, 800, 140, 1.158),
	new SkillInfo(SkillName.Amplifier, ResourceType.cd_Amplifier, Aspect.Other, false,
		0, 0, 0, 0.1),
	new SkillInfo(SkillName.Paradox, ResourceType.cd_GCD, Aspect.Other, true,
		2.5, 1600, 500, 0.624),

	new SkillInfo(SkillName.Addle, ResourceType.cd_Addle, Aspect.Other, false,
		0, 0, 0, 0.1),
	new SkillInfo(SkillName.Swiftcast, ResourceType.cd_Swiftcast, Aspect.Other, false,
		0, 0, 0, 0.1),
	new SkillInfo(SkillName.LucidDreaming, ResourceType.cd_LucidDreaming, Aspect.Other, false,
		0, 0, 0, 0.1),
	new SkillInfo(SkillName.Surecast, ResourceType.cd_Surecast, Aspect.Other, false,
		0, 0, 0, 0.1),
	new SkillInfo(SkillName.Tincture, ResourceType.cd_Tincture, Aspect.Other, false,
		0, 0, 0, 0.1),
];

class Skill
{
	// instances : SkillInstance[]
	constructor(name, requirementFn, effectFn)
	{
		this.name = name;
		this.available = requirementFn;
		this.use = effectFn;
		this.castTime = 1;
		this.info = null;
	}
}

class SkillsList extends Map
{
    constructor(game)
    {
        super();
        this.game = game;
    }
	setSkillInfos(infos)
	{
		infos.forEach(info=>{
			let skill = this.get(info.name);
			skill.info = info;
			skill.castTime = this.game.config.adjustedCastTime(skill.info.baseCastTime);
		});
	}
}

export function makeSkillsList(game)
{
	const skillsList = new SkillsList(game);

	let addResourceAbility = function(skillName, rscType, duration) {
		skillsList.set(skillName, new Skill(skillName,
			() => {
				return true;
			},
			() => {
				game.useInstantSkill(skillName, () => {
					let resource = game.resources.get(rscType);
					if (resource.available(1)) {
						resource.overrideTimer(duration);
					} else {
						resource.gain(1);
						game.resources.addResourceEvent(rscType, "drop " + rscType, duration, rsc=>{
							rsc.consume(1);
						});
					}
				});
			}
		));
	}

	// Blizzard
	skillsList.set(SkillName.Blizzard, new Skill(SkillName.Blizzard,
		() => {
			return true;
		},
		() => {
			if (game.getFireStacks() === 0) // no AF
			{
				game.castSpell(SkillName.Blizzard, cap => {
					game.resources.get(ResourceType.UmbralIce).gain(1);
					game.startOrRefreshEnochian();
				}, app => {
				});
			} else // in AF
			{
				game.castSpell(SkillName.Blizzard, cap => {
					game.resources.get(ResourceType.Enochian).removeTimer();
					game.loseEnochian();
				}, app => {
				});
			}
		}
	));

	let gainFirestarterProc = function(game)
	{
		let fs = game.resources.get(ResourceType.Firestarter);
		if (fs.available(1)) {
			fs.overrideTimer(30);
			controller.log(LogCategory.Event,
				"Firestarter proc! Overriding an existing one",
				game.time, Color.Fire);
		} else {
			fs.gain(1);
			controller.log(LogCategory.Event,
				"Firestarter proc!",
				game.time, Color.Fire);
			game.resources.addResourceEvent(ResourceType.Firestarter,"drop firestarter proc", 30, rsc=>{
				rsc.consume(1);
			}, Color.Fire);
		}
	}

	// Fire
	skillsList.set(SkillName.Fire, new Skill(SkillName.Fire,
		() => {
			return true;
		},
		() => {
			if (game.getIceStacks() === 0) {
				game.castSpell(SkillName.Fire, cap => {
					game.resources.get(ResourceType.AstralFire).gain(1);
					game.startOrRefreshEnochian();
					// umbral heart
					let uh = game.resources.get(ResourceType.UmbralHeart);
					if (cap.capturedManaCost > 0 && uh.available(1)) {
						uh.consume(1);
						controller.log(LogCategory.Event, "consumed an UH stack, remaining: " + uh.currentValue, game.time, Color.Ice);
					}
				}, app => {
				});
			} else {
				game.castSpell(SkillName.Fire, cap => {
					game.resources.get(ResourceType.Enochian).removeTimer();
					game.loseEnochian();
				}, app => {
				});
			}
			// firestarter
			if (Math.random() < 0.4) gainFirestarterProc(game);
		}
	));

	// Transpose
	skillsList.set(SkillName.Transpose, new Skill(SkillName.Transpose,
		() => {
			return game.getFireStacks() > 0 || game.getIceStacks() > 0; // has UI or AF
		},
		() => {
			game.useInstantSkill(SkillName.Transpose, () => {
				if (game.getFireStacks() === 0 && game.getIceStacks() === 0) {
					controller.log(LogCategory.Event, "transpose failed; AF/UI just fell off", game.time, Color.Error);
					return;
				}
				if (game.getFireStacks() > 0) {
					game.switchToAForUI(ResourceType.UmbralIce, 1);
				} else {
					game.switchToAForUI(ResourceType.AstralFire, 1);
				}
				game.startOrRefreshEnochian();
			});
		}
	));

	// Ley Lines
	addResourceAbility(SkillName.LeyLines, ResourceType.LeyLines, 30);

	let gainThundercloudProc = function (game) {
		let thundercloud = game.resources.get(ResourceType.Thundercloud);
		if (thundercloud.available(1)) { // already has a proc; reset its timer
			thundercloud.overrideTimer(40);
			controller.log(LogCategory.Event, "Thundercloud proc! overriding an existing one", game.time, Color.Thunder);
		} else { // there's currently no proc. gain one.
			thundercloud.gain(1);
			controller.log(LogCategory.Event, "Thundercloud proc!", game.time, Color.Thunder);
			game.resources.addResourceEvent(ResourceType.Thundercloud, "drop thundercloud proc", 40, rsc => {
				rsc.consume(1);
			}, Color.Thunder);
		}
	}

	// called at the time of APPLICATION (not snapshot)
	let applyThunderDoT = function(game, capturedTickPotency, numTicks)
	{
		// define stuff
		let recurringThunderTick = (remainingTicks, capturedTickPotency)=>
		{
			if (remainingTicks===0) return;
			game.resources.addResourceEvent(
				ResourceType.ThunderDoTTick,
				"recurring thunder tick " + (numTicks+1-remainingTicks) + "/" + numTicks, 3, rsc=>{
					game.dealDamage(capturedTickPotency, "DoT");
					recurringThunderTick(remainingTicks - 1, capturedTickPotency);
					if (Math.random() < 0.1) // thundercloud proc
					{
						gainThundercloudProc(game);
					}
				}, Color.Thunder);
		};
		let dot = game.resources.get(ResourceType.ThunderDoT);
		let tick = game.resources.get(ResourceType.ThunderDoTTick);
		if (tick.pendingChange !== null) {
			// if already has thunder applied; cancel the remaining ticks now.
			dot.removeTimer();
			tick.removeTimer();
		}
		// order of events:
		dot.gain(1);
		game.resources.addResourceEvent(ResourceType.ThunderDoT, "drop DoT", 30, dot=>{
			dot.consume(1);
		}, Color.Thunder);
		recurringThunderTick(numTicks, capturedTickPotency);
	};

	// Thunder 3
	skillsList.set(SkillName.Thunder3, new Skill(SkillName.Thunder3,
		() => {
			return true;
		},
		() => {
			if (game.resources.get(ResourceType.Thundercloud).available(1)) // made instant via thundercloud
			{
				let skillTime = game.time;
				let capturedInitialPotency = game.captureDamage(Aspect.Other, 400);
				let capturedTickPotency = game.captureDamage(Aspect.Other, game.config.adjustedDoTPotency(35));
				game.useInstantSkill(SkillName.Thunder3, () => {
					game.dealDamage(capturedInitialPotency, "Thunder 3@"+skillTime.toFixed(2));
					applyThunderDoT(game, capturedTickPotency, 10);
				});
				let thundercloud = game.resources.get(ResourceType.Thundercloud);
				thundercloud.consume(1);
				thundercloud.removeTimer();
				// if there's a sharpcast stack, consume it and gain (a potentially new) proc
				let sc = game.resources.get(ResourceType.Sharpcast);
				if (sc.available(1)) {
					gainThundercloudProc(game);
					sc.consume(1);
					sc.removeTimer();
				}
			} else {
				let capturedTickPotency;
				game.castSpell(SkillName.Thunder3, cap => {
					capturedTickPotency = game.captureDamage(Aspect.Lightning, game.config.adjustedDoTPotency(35));
					// if there's a sharpcast stack, consume it and gain (a potentially new) proc
					let sc = game.resources.get(ResourceType.Sharpcast);
					if (sc.available(1)) {
						gainThundercloudProc(game);
						sc.consume(1);
						sc.removeTimer();
					}
				}, app => {
					applyThunderDoT(game, capturedTickPotency, 10);
				});
			}
		}
	));

	// Manaward
	addResourceAbility(SkillName.Manaward, ResourceType.Manaward, 20);

	// Manafont
	skillsList.set(SkillName.Manafont, new Skill(SkillName.Manafont,
		() => {
			return true;
		},
		() => {
			game.useInstantSkill(SkillName.Manafont, () => {
				game.resources.get(ResourceType.Mana).gain(3000);
				controller.log(LogCategory.Event, "manafont effect: mana +3000", game.time);
			}, false);
		}
	));

	// Fire 3
	skillsList.set(SkillName.Fire3, new Skill(SkillName.Fire3,
		() => {
			return true;
		},
		() => {
			let fs = game.resources.get(ResourceType.Firestarter);
			if (fs.available(1)) {
				controller.log(LogCategory.Event, "F3 made instant via firestarter proc", game.time, Color.Fire);
				fs.consume(1);
				fs.removeTimer();
				game.switchToAForUI(ResourceType.AstralFire, 3);
				game.startOrRefreshEnochian();
				game.useInstantSkill(SkillName.Fire3, cap => {
				}, false);
			}
			else
			{
				game.castSpell(SkillName.Fire3, cap => {
					game.switchToAForUI(ResourceType.AstralFire, 3);
					game.startOrRefreshEnochian();
					// umbral heart
					let uh = game.resources.get(ResourceType.UmbralHeart);
					if (cap.capturedManaCost > 0 && uh.available(1)) {
						uh.consume(1);
						controller.log(LogCategory.Event, "consumed an UH stack, remaining: " + uh.currentValue, game.time, Color.Ice);
					}
				}, app => {
				});
			}
		}
	));

	// Blizzard 3
	skillsList.set(SkillName.Blizzard3, new Skill(SkillName.Blizzard3,
		() => {
			return true;
		},
		() => {
			game.castSpell(SkillName.Blizzard3, cap => {
				game.switchToAForUI(ResourceType.UmbralIce, 3);
				game.startOrRefreshEnochian();
			}, app => {
			});
		}
	));

	// Freeze
	skillsList.set(SkillName.Freeze, new Skill(SkillName.Freeze,
		() => {
			return game.getIceStacks() > 0; // in UI
		},
		() => {
			game.castSpell(SkillName.Freeze, cap => {
				game.resources.get(ResourceType.UmbralHeart).gain(3);
			}, app => {
			});
		}
	));

	// Flare
	skillsList.set(SkillName.Flare, new Skill(SkillName.Flare,
		() => {
			return game.getFireStacks() > 0 && // in AF
				game.getMP() >= 800;
		},
		() => {
			game.castSpell(SkillName.Flare, cap => {
				let uh = game.resources.get(ResourceType.UmbralHeart);
				let mana = game.resources.get(ResourceType.Mana);
				let manaCost = uh.available(1) ? mana.currentValue * 2 / 3 : mana.currentValue;
				// mana
				game.resources.get(ResourceType.Mana).consume(manaCost);
				uh.consume(uh.currentValue);
				// +3 AF; refresh enochian
				game.resources.get(ResourceType.AstralFire).gain(3);
				game.startOrRefreshEnochian();
			}, app => {
			});
		}
	));

	// Sharpcast
	addResourceAbility(SkillName.Sharpcast, ResourceType.Sharpcast, 30);

	// Blizzard 4
	skillsList.set(SkillName.Blizzard4, new Skill(SkillName.Blizzard4,
		() => {
			return game.getIceStacks() > 0; // in UI
		},
		() => {
			game.castSpell(SkillName.Blizzard4, cap => {
				game.resources.get(ResourceType.UmbralHeart).gain(3);
			}, app => {
			});
		}
	));

	// Fire 4
	skillsList.set(SkillName.Fire4, new Skill(SkillName.Fire4,
		() => {
			return game.getFireStacks() > 0; // in AF
		},
		() => {
			game.castSpell(SkillName.Fire4, cap => {
			}, app => {
			});
		}
	));

	// Between the Lines
	skillsList.set(SkillName.BetweenTheLines, new Skill(SkillName.BetweenTheLines,
		() => {
			return true;
		},
		() => {
			game.useInstantSkill(SkillName.BetweenTheLines, () => {
			});
		}
	));

	// Aetherial Manipulation
	skillsList.set(SkillName.AetherialManipulation, new Skill(SkillName.AetherialManipulation,
		() => {
			return true;
		},
		() => {
			game.useInstantSkill(SkillName.AetherialManipulation, () => {
			});
		}
	));

	// Triplecast
	skillsList.set(SkillName.Triplecast, new Skill(SkillName.Triplecast,
		() => {
			return true;
		},
		() => {
			game.useInstantSkill(SkillName.Triplecast, () => {
				let triple = game.resources.get(ResourceType.Triplecast);
				if (triple.pendingChange !== null) triple.removeTimer(); // should never need this, but just in case
				triple.gain(3);
				game.resources.addResourceEvent(
					ResourceType.Triplecast,
					"drop remaining Triple charges", 15, rsc => {
						 rsc.consume(rsc.currentValue);
					});
			});
		}
	));

	// Foul
	skillsList.set(SkillName.Foul, new Skill(SkillName.Foul,
		() => {
			return game.resources.get(ResourceType.Polyglot).available(1);
		},
		() => {
			game.resources.get(ResourceType.Polyglot).consume(1);
			game.useInstantSkill(SkillName.Foul, () => {
			}, true);
		}
	));

	// Despair
	skillsList.set(SkillName.Despair, new Skill(SkillName.Despair,
		() => {
			return game.getFireStacks() > 0 && // in AF
				game.getMP() >= 800;
		},
		() => {
			game.castSpell(SkillName.Despair, cap => {
				let mana = game.resources.get(ResourceType.Mana);
				// mana
				mana.consume(mana.currentValue);
				// +3 AF; refresh enochian
				game.resources.get(ResourceType.AstralFire).gain(3);
				game.startOrRefreshEnochian();
			}, app => {
			});
		}
	));

	// Umbral Soul
	skillsList.set(SkillName.UmbralSoul, new Skill(SkillName.UmbralSoul,
		() => {
			return game.getIceStacks() > 0;
		},
		() => {
			game.useInstantSkill(SkillName.UmbralSoul, () => {
				game.resources.get(ResourceType.UmbralIce).gain(1);
				game.resources.get(ResourceType.UmbralHeart).gain(1);
				game.startOrRefreshEnochian();
			});
		}
	));

	// Xenoglossy
	skillsList.set(SkillName.Xenoglossy, new Skill(SkillName.Xenoglossy,
		() => {
			return game.resources.get(ResourceType.Polyglot).available(1);
		},
		() => {
			game.resources.get(ResourceType.Polyglot).consume(1);
			game.useInstantSkill(SkillName.Xenoglossy, () => {
			}, true);
		}
	));

	// High Fire 2
	skillsList.set(SkillName.HighFire2, new Skill(SkillName.HighFire2,
		() => {
			return true;
		},
		() => {
			game.castSpell(SkillName.HighFire2, cap => {
				game.switchToAForUI(ResourceType.AstralFire, 3);
				game.startOrRefreshEnochian();
				// umbral heart
				let uh = game.resources.get(ResourceType.UmbralHeart);
				if (cap.capturedManaCost > 0 && uh.available(1)) {
					uh.consume(1);
					controller.log(LogCategory.Event, "consumed an UH stack, remaining: " + uh.currentValue, game.time, Color.Ice);
				}
			}, app => {
			});
		}
	));

	// High Blizzard 2
	skillsList.set(SkillName.HighBlizzard2, new Skill(SkillName.HighBlizzard2,
		() => {
			return true;
		},
		() => {
			game.castSpell(SkillName.Freeze, cap => {
				game.switchToAForUI(ResourceType.UmbralIce, 3);
				game.startOrRefreshEnochian();
			}, app => {
			});
		}
	));

	// Amplifier
	skillsList.set(SkillName.Amplifier, new Skill(SkillName.Amplifier,
		() => {
			return true;
		},
		() => {
			game.useInstantSkill(SkillName.Amplifier, () => {
				game.resources.get(ResourceType.Polyglot).gain(1);
			});
		}
	));

	// Paradox
	skillsList.set(SkillName.Paradox, new Skill(SkillName.Paradox,
		() => {
			return game.resources.get(ResourceType.Paradox).available(1);
		},
		() => {
			if (game.getFireStacks() > 0) {
				game.castSpell(SkillName.Paradox, cap => {
					game.resources.get(ResourceType.Paradox).consume(1);
					game.startOrRefreshEnochian();
					if (Math.random() < 0.4) // firestarter proc
					{
						gainFirestarterProc(game);
					}
				}, app => {
				});
			} else if (game.getIceStacks() > 0) {
				game.useInstantSkill(SkillName.Paradox, () => {
					game.resources.get(ResourceType.Paradox).consume(1);
					game.startOrRefreshEnochian();
				}, true);
			} else {
				game.castSpell(SkillName.Paradox, cap => {
				}, app => {
				});
			}
		}
	));

	// Addle
	addResourceAbility(SkillName.Addle, ResourceType.Addle, 10);

	// Swiftcast
	addResourceAbility(SkillName.Swiftcast, ResourceType.Swiftcast, 10);

	// Lucid Dreaming
	// TODO: implement lucid ticks
	addResourceAbility(SkillName.LucidDreaming, ResourceType.LucidDreaming, 21);

	// Surecast
	addResourceAbility(SkillName.Surecast, ResourceType.Surecast, 10);

	// Tincture
	addResourceAbility(SkillName.Tincture, ResourceType.Tincture, 15);

	skillsList.setSkillInfos(skillInfos);
	return skillsList;
}
