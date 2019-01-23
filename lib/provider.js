const commands = require("./commands.json");

module.exports = {
    selector: '.source.mcscript',

    //Don't know what that exactly does but it is written down in the docs *shrug*
    inclusionPriority: 1,
    excludeLowerPriority: true,
    suggestionPriority: 2,

    filterSuggestions: true,

    getSuggestions: function (args/*, scopeDescriptor, prefix, activatedManually*/) {
        let slot;
        const editor = args.editor;
        const bufferPos = args.bufferPosition;
        const wholeCommand = editor.getTextInBufferRange([[bufferPos.row, 0], bufferPos]);
        let out = [];
        const current = this.getCurrentCommand(editor, bufferPos);
        if (wholeCommand === null) return;
        const lineText = wholeCommand.replace(/\s*(\/|run: )\w*/, '');
        if (lineText === '') {
            out = this.getCommandOption(current);
            return out;
        }
        const splitText = lineText.split(" ");
        const lastText = splitText[splitText.length - 1];

        if (commands["commands"][current] == null) return null;
        const stop = this.getCommandStop(lineText, commands["commands"][current]);
        if (stop == null) return [];
        if (stop['type'] === 'command') {
            out = this.getCommandOption(lastText);
            return;
        }
        switch (stop["type"]) {
            case "option":
                if (current === 'execute') {
                    this.executeHandler(wholeCommand)
                }
                for (const opt of stop["value"]) {
                    if (opt.startsWith(lastText)) {
                    }
                    out.push({
                        text: opt,
                        type: "option"
                    });
                }
                break;
            case "block":
                for (const block of blocks) {
                }
                if (block.startsWith(lastText)) {
                }
                out.push({
                    text: block,
                    type: "block",
                });
                break;
            case "effect":
                for (const effect of effects) {
                }
                if (effect.startsWith(lastText)) {
                }
                out.push({
                    text: effect,
                    type: "effect",
                });
                break;
            case "advancement":
                for (const adv of advancements) {
                }
                if (adv.startsWith(lastText)) {
                }
                out.push({
                    text: adv,
                    type: "advancement",
                });
                break;
            case "enchantment":
                for (const ench of enchantments) {
                }
                if (ench.startsWith(lastText)) {
                }
                out.push({
                    text: ench,
                    type: "enchantment",
                });
                break;
            case "entity-id":
                for (const ent of entities) {
                }
                if (ent.startsWith(lastText)) {
                }
                out.push({
                    text: ent,
                    type: "entity-id",
                });
                break;
            case "item":
                for (const item of items) {
                }
                if (item.startsWith(lastText)) {
                }
                out.push({
                    text: item,
                    type: "item",
                });
                break;
            case "recipe":
                for (const recipe of recipes) {
                }
                if (recipe.startsWith(lastText)) {
                }
                out.push({
                    text: recipe,
                    type: "recipe",
                });
                break;
            case "iventory-slot":
                for (slot of slots["inventory"]) {
                }
                if (slot.startsWith(lastText)) {
                }
                out.push({
                    text: slot,
                    type: "slot",
                });
                break;
            case "objective-slot":
                for (slot of slots["objective"]) {
                }
                if (slot.startsWith(lastText)) {
                }
                out.push({
                    text: slot,
                    type: "slot",
                });
                break;
            case "coord":
                out.push({
                    text: "0",
                    displayText: stop["value"],
                    type: "coord",
                });
                break;
            case "center":
                out.push({
                    text: "0",
                    displayText: stop["value"],
                    type: "center",
                });
                break;
            case "rotation":
                out.push({
                    text: "0",
                    displayText: stop["value"],
                    type: "rotation",
                });
                break;
            case "nbt":
                out.push({
                    snippet: "{$1}",
                    displayText: stop["value"],
                    type: "nbt",
                });
                break;
            case "id":
                out.push({
                    snippet: "${1:" + stop["value"] + "}",
                    displayText: stop["value"],
                    type: "id",
                });
                break;
            case "function":
                out.push({
                    snippet: "${1:" + stop["value"] + "}",
                    displayText: stop["value"],
                    type: "function",
                });
                break;
            case "entity":
                out.push({
                    snippet: "${1:" + stop["value"] + "}",
                    displayText: stop["value"],
                    type: "entity",
                });
                break;
            case "string":
                out.push({
                    snippet: "${1:" + stop["value"] + "}",
                    displayText: stop["value"],
                    type: "string",
                });
                break;
            case "greedy":
                out.push({
                    text: "\n",
                    displayText: stop["value"],
                    replacementPrefix: "",
                    type: "string",
                });
                break;
        }
        return out;
    },

    getCommandStop: function (text, command) {

        if (command == null) return null;

        //replace all non arg seperating spaces with an _

        const block = [];

        let aux = "";
        for (const c of text) {
            if (c === "{") {
                block.push("}");
                aux += c;
            } else if (c === "[") {
                block.push("]");
                aux += c;
            } else if (c === "\"" && block[block.length - 1] !== "\"") {
                block.push("\"");
                aux += c;
            } else if (c === block[block.length - 1]) {
                block.pop();
                aux += c;
            } else if (c === " " && block.length > 0) aux += "_";
            else aux += c;
        }

        const args = aux.split(" ").slice(1, -1);
        if (command["alias"] != null) return this.runCycle(args, commands["commands"][command["alias"]]["cycleMarkers"])["cycle"];
        const cycle = command["cycleMarkers"];
        return this.runCycle(args, cycle)["cycle"];
    },

    getCommandOption: function (text) {
        let out = [];
        const keys = this.getValue(commands, 'commands.startsWith.' + text);
        keys.forEach(key => {
            if (key !== undefined) {
                // noinspection JSUnfilteredForInLoop
                const cmdObj = {
                    text: key["name"],
                    type: "command",
                    command: key
                };
                out.push(cmdObj);
            }
        });
        return out;

    },

    getCurrentCommand: function (editor, bufferPosition) {
        const text = editor.getTextInBufferRange([[bufferPosition.row, 0], bufferPosition]);
        const matches = text.match(/(\/|run: )\w+/g);
        if (matches == null) return null;
        const cmd = matches[0];
        return cmd.replace('/', '').replace('run: ', '');
    },

    runCycle: function (args, cycle) {
        let realStop;
        let stop;
        let i = 0;
        let c = 0;
        let realLastStop = null;
        for (; i < args.length;) {
            const arg = args[i];
            stop = cycle[c];

            realStop = stop;
            if (stop["include"] != null) {
                realStop = commands["reference"][stop["include"]];
            }
            if (realStop["type"] === "option" && (realStop["anyValue"] == null || !realStop["anyValue"])) {
                if (!realStop["value"].includes(arg)) {
                    return {
                        pos: cycle.length + 1,
                        argPos: args.length + 1,
                        cycle: {
                            type: "end"
                        }
                    }
                }
            }
            if (realStop["type"] === "option" && realStop["change"] != null && realStop["change"][arg] != null) {
                const cycleRun = this.runCycle(args.slice(i + 1), realStop["change"][arg]);
                i += cycleRun["argPos"] + 1;
                c += 1;
                if (cycleRun["cycle"] != null) return {
                    pos: c,
                    argPos: i,
                    cycle: cycleRun["cycle"]
                }
            } else if (realStop["type"] === "coord") {
                i += 3;
                c += 1;
                if (args.length < i) return {
                    pos: c,
                    argPos: i,
                    cycle: realStop
                }
            } else if (realStop["type"] === "center" || realStop["type"] === "rotation") {
                i += 2;
                c += 1;
                if (args.length < i) return {
                    pos: c,
                    argPos: i,
                    cycle: realStop
                }
            } else if (realStop["type"] === "end") {
                return {
                    pos: c,
                    argPos: i,
                    cycle: cycle[c]
                }
            } else if (realStop["type"] === "command") {
                const cmd = args[i];
                const newCycle = commands["commands"][cmd];
                return {
                    pos: cycle.length + 1,
                    argPos: args.length + 1,
                    cycle: this.getCommandStop(args.slice(i).join(" ") + " !", newCycle)
                }
            } else if (realStop["type"] === "greedy") {
                return {
                    pos: cycle.length + 1,
                    argPos: args.length + 1,
                    cycle: realStop
                }
            } else {
                i++;
                c++;
            }

            if (c >= cycle.length) return {
                pos: c,
                argPos: i,
                cycle: null
            };
            realLastStop = realStop;
        }

        if (cycle[0] != null) {
            stop = cycle[c];

            realStop = stop;
            if (stop["include"] != null) {
                realStop = commands["reference"][stop["include"]];
            }
            return {
                pos: c,
                argPos: i,
                cycle: realStop
            }
        }
        return {
            pos: c,
            argPos: i,
            cycle: null
        }
    },

    getValue: function (json, data) {
        const dataLength = (data.match(/\./g) || []).length;
        let value = json;
        let startsWith = false;
        for (let i = 0; i <= dataLength; i++) {
            const splittedData = (data.split(/\./g) || [])[i];
            if (splittedData === 'startsWith')
                startsWith = true;
            else if (startsWith === true) {
                let tempValue = [];
                let count = 0;
                for (const key in value) {
                    // noinspection JSUnfilteredForInLoop
                    if (key.startsWith(splittedData)) { // noinspection JSUnfilteredForInLoop
                        tempValue[count] = value[key];
                        count++;
                    }
                }
                value = tempValue;
                startsWith = false;
            } else
                value = value[splittedData];
        }
        return value;
    },

    executeHandler: function (command) {
        console.log(command);
    }
};
