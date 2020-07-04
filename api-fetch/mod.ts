// deno run --allow-net=api.spacexdata.com mod.ts
import _ from "https://deno.land/x/deno_lodash/mod.ts";
import * as log from "https://deno.land/std/log/mod.ts";

interface ILaunch {
  flightNumber: number;
  mission: string;
  rocket: string;
  customers: string[];
}

interface IPayload {
  customers: string[];
}

const launches = new Map<number, ILaunch>();

export const downloadLaunchData = async () => {
  log.info("Downloading launch data...");

  const response = await fetch(
    "https://api.spacexdata.com/v3/launches",
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    log.warning("Problem downloading launch data.");
    throw new Error("Launch data download failed!");
  }

  const launchData = await response.json();

  for (const launch of launchData) {
    const payloads = launch["rocket"]["second_stage"]["payloads"] as IPayload[];
    const customers = _.flatMap(payloads, (payload: IPayload) => {
      return payload["customers"];
    });

    const flightData = {
      flightNumber: launch["flight_number"],
      mission: launch["mission_name"],
      rocket: launch["rocket"]["rocket_name"],
      customers,
    };

    launches.set(flightData.flightNumber, flightData);

    log.info(JSON.stringify(flightData));
  }
};

if (import.meta.main) {
  await downloadLaunchData();
  log.info(JSON.stringify(import.meta));
  log.info(`Downloaded data for ${launches.size} SpaceX launches`);
}
