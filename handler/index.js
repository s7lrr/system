const fs = require("fs");
const path = require("path");
const Data = require("pro.db");

 function getJsFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of list) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      results = results.concat(getJsFiles(fullPath));
    } else if (item.isFile() && item.name.endsWith(".js")) {
      results.push(fullPath);
    }
  }

  return results;
}

module.exports = async (client) => {
 
  const commandsDir = path.join(process.cwd(), "Commands");
  const eventsDir = path.join(process.cwd(), "events");
  const extrasDir = path.join(process.cwd(), "Extras", "Guild");

   if (!fs.existsSync(commandsDir)) {
    console.log("❌ Commands folder not found:", commandsDir);
  } else {
    const commandFiles = getJsFiles(commandsDir);
 
    commandFiles.forEach((value) => {
      try {
        const file = require(value);

        const splitted = value.split(/[\\/]/);
        const directory = splitted[splitted.length - 2];

        const isEnabled = Data.get(`command_enabled_${file.name}`);
        if (isEnabled === false) return;

        if (file.name) {
          const properties = { directory, ...file };
          client.commands.set(file.name, properties);

          if (Array.isArray(file.aliases)) {
            file.aliases.forEach((alias) => {
              const aliasIsEnabled = Data.get(`command_enabled_${alias}`);
              if (aliasIsEnabled === false) return;
              client.commands.set(alias, properties);
            });
          }
        }
      } catch (err) {
        console.error("❌ Command load failed:", value);
        console.error(err);
      }
    });
  }

   if (!fs.existsSync(eventsDir)) {
   } else {
    const eventFiles = fs
      .readdirSync(eventsDir)
      .filter((f) => f.endsWith(".js"))
      .map((f) => path.join(eventsDir, f));

 
    eventFiles.forEach((value) => {
      try {
        require(value);
      } catch (err) {
        console.error("❌ Event load failed:", value);
        console.error(err);
      }
    });
  }

   if (fs.existsSync(extrasDir)) {
    const extras = fs.readdirSync(extrasDir).filter((f) => f.endsWith(".js"));
 
    extras.forEach((file) => {
      try {
        require(path.join(extrasDir, file));
      } catch (err) {
        console.error("❌ Extra load failed:", file);
        console.error(err);
      }
    });
  } else {
    console.log("❌ Extras/Guild folder not found:", extrasDir);
  }
};
