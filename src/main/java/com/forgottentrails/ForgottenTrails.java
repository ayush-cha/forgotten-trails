package com.forgottentrails;

import java.util.Random;
import net.fabricmc.api.ModInitializer;
import net.fabricmc.fabric.api.event.lifecycle.v1.ServerChunkEvents;
import net.minecraft.core.BlockPos;
import net.minecraft.core.registries.Registries;
import net.minecraft.resources.Identifier;
import net.minecraft.resources.ResourceKey;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.CampfireBlock;
import net.minecraft.world.level.block.entity.BlockEntity;
import net.minecraft.world.level.block.entity.RandomizableContainerBlockEntity;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.chunk.LevelChunk;
import net.minecraft.world.level.levelgen.Heightmap;
import net.minecraft.world.level.storage.loot.LootTable;

public final class ForgottenTrails implements ModInitializer {
    private static final ResourceKey<LootTable> CAMP_LOOT = ResourceKey.create(
        Registries.LOOT_TABLE,
        Identifier.fromNamespaceAndPath("forgotten_trails", "chests/ruined_camp")
    );
    private static final int CHANCE_PER_CHUNK = 72;

    @Override
    public void onInitialize() {
        ServerChunkEvents.CHUNK_GENERATE.register(ForgottenTrails::generateCamp);
    }

    private static void generateCamp(ServerLevel level, LevelChunk chunk) {
        if (level.dimension() != Level.OVERWORLD) return;

        long seed = level.getSeed() ^ (chunk.getPos().x() * 341873128712L)
            ^ (chunk.getPos().z() * 132897987541L) ^ 0x6A09E667F3BCC909L;
        Random random = new Random(seed);
        if (random.nextInt(CHANCE_PER_CHUNK) != 0) return;

        int x = chunk.getPos().getMinBlockX() + 8;
        int z = chunk.getPos().getMinBlockZ() + 8;
        int y = level.getHeight(Heightmap.Types.MOTION_BLOCKING_NO_LEAVES, x, z) - 1;
        if (y <= level.getSeaLevel() + 1) return;

        // Stay inside the newly generated chunk and leave uneven terrain untouched.
        for (int dx = -2; dx <= 2; dx++) {
            for (int dz = -2; dz <= 2; dz++) {
                int tileY = level.getHeight(Heightmap.Types.MOTION_BLOCKING_NO_LEAVES, x + dx, z + dz) - 1;
                if (tileY != y) return;
                BlockPos ground = new BlockPos(x + dx, y, z + dz);
                if (!suitableGround(level.getBlockState(ground))
                    || !level.getBlockState(ground.above()).canBeReplaced()
                    || !level.getBlockState(ground.above(2)).canBeReplaced()) return;
            }
        }

        // A worn clearing and a short, broken gravel trail.
        for (int dx = -2; dx <= 2; dx++) {
            for (int dz = -2; dz <= 2; dz++) {
                BlockPos ground = new BlockPos(x + dx, y, z + dz);
                level.setBlockAndUpdate(ground,
                    dz == 0 ? Blocks.GRAVEL.defaultBlockState() : Blocks.COARSE_DIRT.defaultBlockState());
                level.setBlockAndUpdate(ground.above(), Blocks.AIR.defaultBlockState());
            }
        }
        for (int dx : new int[] {-5, -4, -3, 3, 4, 5}) {
            BlockPos ground = new BlockPos(x + dx, y, z);
            if (level.getHeight(Heightmap.Types.MOTION_BLOCKING_NO_LEAVES, ground.getX(), ground.getZ()) - 1 == y
                && suitableGround(level.getBlockState(ground))
                && level.getBlockState(ground.above()).canBeReplaced()) {
                level.setBlockAndUpdate(ground, Blocks.GRAVEL.defaultBlockState());
                level.setBlockAndUpdate(ground.above(), Blocks.AIR.defaultBlockState());
            }
        }

        BlockPos center = new BlockPos(x, y + 1, z);
        level.setBlockAndUpdate(center, Blocks.CAMPFIRE.defaultBlockState().setValue(CampfireBlock.LIT, false));
        for (BlockPos stone : new BlockPos[] {
            center.north(), center.south(), center.east(), center.west()
        }) level.setBlockAndUpdate(stone, Blocks.COBBLESTONE.defaultBlockState());

        // Fallen log seats and the remains of a small shelter.
        level.setBlockAndUpdate(center.offset(-2, 0, 0), Blocks.OAK_LOG.defaultBlockState());
        level.setBlockAndUpdate(center.offset(2, 0, 0), Blocks.OAK_LOG.defaultBlockState());
        level.setBlockAndUpdate(center.offset(-2, 0, -2), Blocks.OAK_FENCE.defaultBlockState());
        level.setBlockAndUpdate(center.offset(-2, 1, -2), Blocks.OAK_FENCE.defaultBlockState());
        level.setBlockAndUpdate(center.offset(2, 0, -2), Blocks.OAK_FENCE.defaultBlockState());

        BlockPos chestPos = center.offset(2, 0, 2);
        level.setBlockAndUpdate(chestPos, Blocks.CHEST.defaultBlockState());
        BlockEntity blockEntity = level.getBlockEntity(chestPos);
        if (blockEntity instanceof RandomizableContainerBlockEntity chest) {
            chest.setLootTable(CAMP_LOOT);
            chest.setLootTableSeed(random.nextLong());
        }
    }

    private static boolean suitableGround(BlockState state) {
        return state.is(Blocks.GRASS_BLOCK) || state.is(Blocks.DIRT)
            || state.is(Blocks.COARSE_DIRT) || state.is(Blocks.PODZOL)
            || state.is(Blocks.SAND) || state.is(Blocks.RED_SAND);
    }
}
