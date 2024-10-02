import { Config } from "../lib/config";
import { deployCommands } from "../lib/deploy-commands";

deployCommands({ guildId: Config.DISCORD_GUILD_ID });
