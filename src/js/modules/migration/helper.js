export { addCurrencyToSave, raiseUpgradeLevel, removeUpgrade, removeCurrency, refundCurrency, replaceTreasureEffect, removeRelic }

function addCurrencyToSave(save, currency, amount) {
    if (save.currency[currency] === undefined) {
        save.currency[currency] = 0;
    }
    save.currency[currency] += amount;

    if (save.stat[currency] === undefined) {
        save.stat[currency] = {value: 0, total: 0};
    }
    save.stat[currency].value += amount;
    save.stat[currency].total += amount;

    const maxStatName = currency + 'Max';

    if (save.stat[maxStatName] === undefined) {
        save.stat[maxStatName] = {value: 0, total: 0};
    }
    save.stat[maxStatName].value = Math.max(amount, save.stat[maxStatName].value);
    save.stat[maxStatName].total = Math.max(amount, save.stat[maxStatName].total);

    return save;
}

function raiseUpgradeLevel(save, name, amount) {
    if (save.upgrade[name] !== undefined) {
        save.upgrade[name].level += amount;
        save.upgrade[name].highestLevel = Math.max(save.upgrade[name].level, save.upgrade[name].highestLevel);
    }

    return save;
}

function removeUpgrade(save, name) {
    if (save.upgrade[name] !== undefined) {
        delete save.upgrade[name];
    }
    return save;
}

function removeCurrency(save, name) {
    if (save.currency[name] !== undefined) {
        delete save.currency[name];
    }
    if (save.stat[name] !== undefined) {
        delete save.stat[name];
    }
    return save;
}

function refundCurrency(save, name) {
    if (save.currency[name] !== undefined && save.stat[name] !== undefined) {
        save.currency[name] = save.stat[name].total;
    }
    return save;
}

function replaceTreasureEffect(save, oldName, newName) {
    if (save.treasure) {
        if (save.treasure.newItem) {
            save.treasure.newItem.effect = save.treasure.newItem.effect.map(effect => effect === oldName ? newName : effect);
        }
        save.treasure.items.forEach(treasure => {
            treasure.effect = treasure.effect.map(effect => effect === oldName ? newName : effect);
        });
    }
    return save;
}

function removeRelic(save, name) {
    if (save.relic) {
        save.relic = save.relic.map(elem => elem !== name);
    }
    return save;
}
