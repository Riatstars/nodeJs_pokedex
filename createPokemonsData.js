const fs = require("fs");
const csv = require("csvtojson");
require("dotenv").config();
const mainUrl = process.env.MAIN_URL;

const createPokemonsData = async () => {
  let newData = await csv().fromFile("resources/pokemon.csv");
  let data = JSON.parse(fs.readFileSync("db.json"));
  const pokemonsList = [];

  //   console.log(newData);
  newData.forEach((pokemon, index) => {
    const type = [pokemon.Type1.toLowerCase()];
    if (!!pokemon.Type2) {
      type.push(pokemon.Type2.toLowerCase());
    }

    pokemonsList.push({
      id: index + 1,
      name: pokemon.Name,
      types: type,
      url: `${mainUrl}/pokemon_icons/images/${pokemon.Name}.png`,
    });
  });
  data.pokemons = pokemonsList;
  data.totalPokemons = data.pokemons.length;
  data = JSON.stringify(data);
  fs.writeFileSync("db.json", data);

  //
};
createPokemonsData();
