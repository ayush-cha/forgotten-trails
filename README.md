# Forgotten Trails

A small Fabric mod for Minecraft Java 26.1.2. Forgotten Trails adds abandoned camps to newly generated Overworld terrain. Camps have a cold campfire, remnants of a shelter, a supply chest, and a short broken gravel trail. Light the campfire with flint and steel to make the site useful again.

A camp chest has a one-in-three chance to contain a **Trail Map** pointing to the nearest desert pyramid, jungle pyramid, or trial chamber within the map's search range. Other loot consists of ordinary travel supplies. If no target structure is found, Minecraft may leave the map unmarked.

## Install

1. Install Fabric Loader and Fabric API for Minecraft Java 26.1.2.
2. Download the release JAR and put it in the Fabric profile's `mods` folder.
3. Generate new Overworld chunks to find camps. Existing terrain is left alone.

## MVP details

- Each newly generated Overworld chunk has a 1-in-72 initial camp chance. A camp is placed only on a dry, flat 5×5 patch of grass, dirt, podzol, or sand above sea level, so actual frequency is lower.
- Camps are built from vanilla blocks and fit entirely inside one chunk.
- Trail maps use vanilla explorer-map behaviour and the mod's structure tag.
- No new items or textures are required.

## Build

Use JDK 25 or newer, then run `./gradlew build` (`gradlew.bat build` on Windows). The wrapper is Gradle 9.8.1. The built mod appears at `build/libs/forgotten-trails-0.1.0.jar`.

The release JAR was compiled against Minecraft 26.1.2 and Fabric API 0.151.0+26.1.2, and its metadata and JSON were checked. In-game testing remains to be done.
