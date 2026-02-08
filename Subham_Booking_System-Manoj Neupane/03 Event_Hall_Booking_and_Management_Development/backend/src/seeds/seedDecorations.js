import mongoose from "mongoose";
import DecorationScheme from "../models/DecorationScheme.js";
import DecorationAddon from "../models/DecorationAddon.js";
import { decorationSchemes, decorationAddons } from "./data/decorations.js";
import { assertEnv } from "../config/env.config.js";
import getDBConnection from "../connectDB.js";

async function run() {
  try {
    assertEnv();
    await getDBConnection();

    await DecorationScheme.deleteMany({});
    await DecorationAddon.deleteMany({});

    const insertedAddons = await DecorationAddon.insertMany(decorationAddons);
    const addonKeyMap = insertedAddons.reduce((acc, addon) => {
      acc[addon.key] = addon._id;
      return acc;
    }, {});

    const schemesWithRefs = decorationSchemes.map((scheme) => ({
      ...scheme,
      includedAddons: (scheme.includedAddonKeys || [])
        .map((k) => addonKeyMap[k])
        .filter(Boolean),
    }));

    await DecorationScheme.insertMany(schemesWithRefs);

    console.log("Seeded decoration schemes and addons");
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
