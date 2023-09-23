import store from "../../store";
import { MINUTES_PER_DAY } from "../constants";
import { buildArray } from "../utils/array";

const data = {
    mining: [
        {mining_crystalGreen: 'mining_bestPrestige0'},
        {mining_crystalYellow: 'mining_bestPrestige1'},
    ],
    village: [
        {village_blessing: 'village_bestPrestige'},
    ],
    horde: [
        {horde_soulEmpowered: 'horde_bestPrestige'},
    ],
    farm: [
        {farm_exp: 'farm_bestPrestige'},
    ],
    gallery: [
        {gallery_cash: 'gallery_bestPrestige'},
    ]
};

const effect = {
    mining: [
        [{name: 'currencyMiningCrystalGreenGain', type: 'mult', value: lvl => lvl * 0.1 + 1}],
        [{name: 'currencyMiningCrystalYellowGain', type: 'mult', value: lvl => lvl * 0.1 + 1}],
    ],
    village: [
        [
            {name: 'currencyVillageFaithGain', type: 'mult', value: lvl => lvl * 0.1 + 1},
            {name: 'currencyVillageFaithCap', type: 'mult', value: lvl => lvl * 0.1 + 1}
        ],
    ],
    horde: [
        [{name: 'hordeSoulGain', type: 'mult', value: lvl => lvl * 0.1 + 1}],
    ],
    farm: [
        [{name: 'farmExperience', type: 'mult', value: lvl => lvl * 0.1 + 1}],
    ],
    gallery: [
        [{name: 'currencyGalleryCashGain', type: 'mult', value: lvl => lvl * 0.1 + 1}],
    ]
};

export default {
    name: 'cryolab',
    tickspeed: 60,
    unlockNeeded: 'cryolabFeature',
    tick(minutes) {
        for (const [key, elem] of Object.entries(store.state.cryolab)) {
            if (elem.active) {
                const expGain = store.getters['cryolab/expGain'](key);
                if (expGain > 0) {
                    store.dispatch('cryolab/gainExp', {feature: key, amount: expGain * minutes / MINUTES_PER_DAY});
                }
            }
            const prestigeGain = store.getters['cryolab/prestigeGain'](key);
            for (const [currency, amount] of Object.entries(prestigeGain)) {
                if (currency === 'farm_exp') {
                    // Special handler for farm experience
                    for (const [key, elem] of Object.entries(store.state.farm.crop)) {
                        if (elem.found) {
                            store.dispatch('farm/getCropExp', {crop: key, value: amount * elem.baseExpMult * minutes / MINUTES_PER_DAY});
                        }
                    }
                } else {
                    const split = currency.split('_');
                    store.dispatch('currency/gain', {feature: split[0], name: split[1], amount: amount * minutes / MINUTES_PER_DAY});
                }
            }
        }
    },
    unlock: ['cryolabFeature'],
    mult: {
        cryolabMaxFeatures: {round: true, baseValue: 1},
    },
    note: buildArray(2).map(() => 'g'),
    init() {
        for (const [key, elem] of Object.entries(store.state.system.features)) {
            let obj = {name: key, unlock: elem.unlock};
            if (data[key] !== undefined) {
                obj.data = data[key];
            }
            if (effect[key] !== undefined) {
                obj.effect = effect[key];
            }
            if (elem.main) {
                store.dispatch('cryolab/init', obj);
            }
        }
    },
    saveGame() {
        let obj = {};
        for (const [key, elem] of Object.entries(store.state.cryolab)) {
            if (elem.active || elem.exp.find(elem => elem > 0) || elem.level.find(elem => elem > 0)) {
                obj[key] = {active: elem.active, exp: elem.exp, level: elem.level};
            }
        }
        return obj;
    },
    loadGame(data) {
        for (const [key, elem] of Object.entries(data)) {
            if (store.state.cryolab[key] !== undefined) {
                store.commit('cryolab/updateKey', {name: key, key: 'active', value: elem.active});
                elem.exp.forEach((value, index) => {
                    store.commit('cryolab/updateSubfeatureKey', {name: key, subfeature: index, key: 'exp', value});
                });
                elem.level.forEach((value, index) => {
                    store.commit('cryolab/updateSubfeatureKey', {name: key, subfeature: index, key: 'level', value});
                    store.dispatch('cryolab/applyLevelEffects', {feature: key, subfeature: index});
                });
            }
        }
    }
}