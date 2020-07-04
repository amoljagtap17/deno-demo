import { join } from "https://deno.land/std/path/mod.ts";
import { BufReader } from "https://deno.land/std/io/bufio.ts";
import { parse } from "https://deno.land/std/encoding/csv.ts";
import _ from "https://deno.land/x/deno_lodash/mod.ts";

interface IPlanet {
  [key: string]: string;
}

const loadPlanetsData = async () => {
  const path = join(".", "kepler_exoplanets_nasa.csv");

  const file = await Deno.open(path);
  const bufReader = new BufReader(file);

  const data = await parse(bufReader, {
    header: true,
    comment: "#",
  });

  Deno.close(file.rid);

  const planets = (data as IPlanet[]).filter((planet) => {
    const planetaryRadius = Number(planet["koi_prad"]);
    const stellarMass = Number(planet["koi_smass"]);
    const stellarRadius = Number(planet["koi_srad"]);

    return planet["koi_disposition"] === "CONFIRMED" && planetaryRadius > 0.5 &&
      planetaryRadius < 1.5 && stellarMass > 0.78 && stellarMass < 1.04 &&
      stellarRadius > 0.99 && stellarRadius < 1.01;
  });

  return planets.map((planet) => {
    return _.pick(planet, [
      "koi_prad",
      "koi_smass",
      "koi_srad",
      "kepler_name",
      "koi_count",
      "koi_steff",
    ]);
  });
};

const newPlanets = await loadPlanetsData();

for (const planet of newPlanets) {
  console.log(planet);
}

console.log(`${newPlanets.length} habitable planets found!`);
