const commands = require("./commands.json");

module.exports = {
  selector: '.source.mcscript',

  //Don't know what that exactly does but it is written down in the docs *shrug*
  inclusionPriority: 1,
  excludeLowerPriority: true,
  suggestionPriority: 2,

  filterSuggestions: true,

  getSuggestions: function (args/*, scopeDescriptor, prefix, activatedManually*/) {
    const editor = args.editor;
    const bufferPos = args.bufferPosition;
    const lineText = editor.getTextInBufferRange([[bufferPos.row, 0], bufferPos]);
    let out = [];
    const current = this.getCurrentCommand(editor, bufferPos);
		if(!lineText.includes(" ")) {
			out = this.getCommandOption(lineText.replace("/",""));
		} else if(current != null) {

			var splitText = lineText.split(" ");
			var lastText = splitText[splitText.length - 1];

			if(commands["commands"][current] == null) return null;
			var stop = this.getCommandStop(lineText, commands["commands"][current]);
			if(stop == null) return [];
			if(stop["type"] == "command") out = this.getCommandOption(lastText);
			else if(stop["type"] == "option") for(var opt of stop["value"]) {
				if(opt.startsWith(lastText)) out.push({
          text: opt,
          type: "option"
        });
    } else if(stop["type"] == "block") {
      for(var block of blocks) if(block.startsWith(lastText)) out.push({
        text: block,
        type: "block",
      });
    } else if(stop["type"] == "effect") {
      for(var effect of effects) if(effect.startsWith(lastText)) out.push({
        text: effect,
        type: "effect",
      });
    } else if(stop["type"] == "advancement") {
      for(var adv of advancements) if(adv.startsWith(lastText)) out.push({
        text: adv,
        type: "advancement",
      });
    } else if(stop["type"] == "enchantment") {
      for(var ench of enchantments) if(ench.startsWith(lastText)) out.push({
        text: ench,
        type: "enchantment",
      });
    } else if(stop["type"] == "entity-id") {
      for(var ent of entities) if(ent.startsWith(lastText)) out.push({
        text: ent,
        type: "entity-id",
      });
    } else if(stop["type"] == "item") {
      for(var item of items) if(item.startsWith(lastText)) out.push({
        text: item,
        type: "item",
      });
    } else if(stop["type"] == "recipe") {
      for(var recipe of recipes) if(recipe.startsWith(lastText)) out.push({
        text: recipe,
        type: "recipe",
      });
    } else if(stop["type"] == "iventory-slot") {
      for(var slot of slots["inventory"]) if(slot.startsWith(lastText)) out.push({
        text: slot,
        type: "slot",
      });
    } else if(stop["type"] == "objective-slot") {
      for(var slot of slots["objective"]) if(slot.startsWith(lastText)) out.push({
        text: slot,
        type: "slot",
      });
    }
    else if(stop["type"] == "coord") out.push({
      text: "0",
      displayText: stop["value"],
      type: "coord",
    });
    else if(stop["type"] == "center") out.push({
      text: "0",
      displayText: stop["value"],
      type: "center",
    });
    else if(stop["type"] == "rotation") out.push({
      text: "0",
      displayText: stop["value"],
      type: "rotation",
    });
    else if(stop["type"] == "nbt") out.push({
      snippet: "{$1}",
      displayText: stop["value"],
      type: "nbt",
    });
    else if(stop["type"] == "id") out.push({
      snippet: "${1:" + stop["value"] + "}",
      displayText: stop["value"],
      type: "id",
    });
    else if(stop["type"] == "function") out.push({
      snippet: "${1:" + stop["value"] + "}",
      displayText: stop["value"],
      type: "function",
    });
    else if(stop["type"] == "entity") out.push({
      snippet: "${1:" + stop["value"] + "}",
      displayText: stop["value"],
      type: "entity",
    });
    else if(stop["type"] == "string") out.push({
      snippet: "${1:" + stop["value"] + "}",
      displayText: stop["value"],
      type: "string",
    });
    else if(stop["type"] == "greedy") out.push({
      text: "\n",
      displayText: stop["value"],
      replacementPrefix: "",
      type: "string",
    })
  return out;
  }
},

  getCommandStop: function (text, command) {

    if(command == null) return null;

    //replace all non arg seperating spaces with an _

    var block = [];

    var aux = "";
    for(var c of text) {
      if(c == "{") {
        block.push("}");
        aux += c;
      } else if(c == "[") {
        block.push("]");
        aux += c;
      } else if(c == "\"" && block[block.length - 1] != "\"") {
        block.push("\"");
        aux += c;
      } else if(c == block[block.length - 1]) {
        block.pop();
        aux += c;
      } else if(c == " " && block.length > 0) aux += "_";
      else aux += c;
    }

    var args = aux.split(" ").slice(1, -1);
    if(command["alias"] != null) return this.runCycle(args, commands["commands"][command["alias"]]["cycleMarkers"])["cycle"]
    var cycle = command["cycleMarkers"];
    return this.runCycle(args, cycle)["cycle"];
  },

  getCommandOption: function(text) {
    let out = [];
    for(let cmd of Object.values(commands["commands"])) {
      if(cmd["name"].startsWith(text)) {
        var cmdObj = {
          text: cmd["name"],
          type: "command",
          command: cmd
        };
        out.push(cmdObj);
      }
    }
    return out;
  },

  getCurrentCommand: function (editor, bufferPosition) {
		var text = editor.getTextInBufferRange([[bufferPosition.row, 0], bufferPosition]);
		var matches = text.match(/(\/|run: )\w+/g);
		if(matches == null) return null;
		var cmd = matches[0];
		return cmd.replace("/","");
	},

  runCycle: function(args, cycle) {
		var i = 0;
		var c = 0;
		var realLastStop = null;
		for(; i < args.length; ) {
			var arg = args[i];
			var stop = cycle[c];

			var realStop = stop;
			if (stop["include"] != null) {
				realStop = commands["reference"][stop["include"]];
			}
			if(realStop["type"] == "option" && (realStop["anyValue"] == null || ! realStop["anyValue"])) {
				if(! realStop["value"].includes(arg)) {
					return {
						pos: cycle.length + 1,
						argPos: args.length + 1,
						cycle: {
							type: "end"
						}
					}
				}
			}
			if (realStop["type"] == "option" && realStop["change"] != null && realStop["change"][arg] != null) {
				var cycleRun = this.runCycle(args.slice(i + 1), realStop["change"][arg]);
				i += cycleRun["argPos"] + 1;
				c += 1;
				if(cycleRun["cycle"] != null) return {
					pos: c,
					argPos: i,
					cycle: cycleRun["cycle"]
				}
			} else if(realStop["type"] == "coord") {
				i += 3;
				c += 1;
				if(args.length < i) return {
					pos: c,
					argPos: i,
					cycle: realStop
				}
			} else if(realStop["type"] == "center" || realStop["type"] == "rotation") {
				i += 2;
				c += 1;
				if(args.length < i) return {
					pos: c,
					argPos: i,
					cycle: realStop
				}
			} else if (realStop["type"] == "end") {
				return {
					pos: c,
					argPos: i,
					cycle: cycle[c]
				}
			} else if(realStop["type"] == "command") {
				var cmd = args[i];
				var newCycle = commands["commands"][cmd];
				return {
					pos: cycle.length + 1,
					argPos: args.length + 1,
					cycle: this.getCommandStop(args.slice(i).join(" ") + " !", newCycle)
				}
			} else if(realStop["type"] == "greedy") {
				return {
					pos: cycle.length + 1,
					argPos: args.length + 1,
					cycle: realStop
				}
			} else {
				i++;
				c++;
			}

			if(c >= cycle.length) return {
				pos: c,
				argPos: i,
				cycle: null
			}
			realLastStop = realStop;
		}

		if(cycle[0] != null) {
			var stop = cycle[c];

			var realStop = stop;
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
	}
}
