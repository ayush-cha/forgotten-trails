# Forgotten Trails

Forgotten Trails is a vanilla+ Fabric mod for Minecraft Java 26.1.2. It adds small abandoned camps with a cold campfire, broken trail, and supply chest to newly generated Overworld terrain.

## Find a camp

Use `/locate structure forgotten_trails:ruined_camp` with cheats or operator access. Camps generate in plains, forests, savannas, deserts, and meadows, roughly one placement attempt per 10×10 chunk region. Terrain and biome rules can make them farther apart. Explore new chunks after installing v0.2.0; old camps from v0.1.0 cannot be found with `/locate`.

A camp chest has a one-in-three chance of a **Trail Map** pointing to a desert pyramid, jungle pyramid, or trial chamber within the map's search range. Other loot consists of travel supplies.

## Install

1. Install Fabric Loader for Minecraft Java 26.1.2.
2. Download `forgotten-trails-0.2.0.jar` from the [v0.2.0 release](https://github.com/ayush-cha/forgotten-trails/releases/tag/v0.2.0) and place it in your Fabric profile's `mods` folder.
3. Start a world and explore newly generated Overworld chunks.

## Build and test

Use JDK 25 or newer. Run `./gradlew build` (`gradlew.bat build` on Windows). Run `node tools/generate-structure.mjs` to regenerate the camp template and `node tools/validate.mjs` to check the worldgen references, NBT structure, and chest loot.

The v0.2.0 template and data validation passed. An isolated Minecraft server could not open its test world due to a Windows filesystem access error, so in-game generation and `/locate` have not yet been verified.
