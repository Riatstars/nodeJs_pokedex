const fs = require("fs");
const csv = require("csvtojson");
require("dotenv").config();
const mainUrl = process.env.MAIN_URL;

const createEvolutionsData = async () => {
  let newData = JSON.parse(
    fs.readFileSync("./resources/Pokemon-evolution.json")
  );
  let data = JSON.parse(fs.readFileSync("db.json"));
  const pokemonsList = data.pokemons;
  const checker = [];
  for (i = 0; i < Object.keys(newData.evolutions).length; i++) {
    const pokemonInfo = pokemonsList.filter(
      (pokemon) => pokemon.name == newData.pokemon_name[i].toLowerCase()
    )[0];

    newData.evolutions[i] = newData.evolutions[i].forEach((end) => {
      const returnItem = {
        startId: pokemonInfo.id,
        startName: pokemonInfo.name,
        endId: end.pokemon_id,
        endName: end.pokemon_name.toLowerCase(),
      };
      const checkValue = JSON.stringify([returnItem.startId, returnItem.endId]);
      if (!checker.includes(checkValue)) {
        checker.push(checkValue);
      }
    });
  }
  data.evolutions = checker.map((evolution) => JSON.parse(evolution));
  data.evolutions = data.evolutions.filter(
    (evo) => evo[0] <= data.totalPokemons && evo[1] <= data.totalPokemons
  );
  fs.writeFileSync("db.json", JSON.stringify(data));
  //
};
createEvolutionsData();
