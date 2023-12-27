var express = require("express");
var router = express.Router();
var fs = require("fs");

/* GET home page. */
router.get("/", function (req, res, next) {
  const { body, params, url, query } = req;
  console.log({ body, params, url, query });
  //input validation
  const allowedFilter = ["search", "type", "page", "limit"];
  try {
    let { page, limit, type, search, ...filterQuery } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 15;
    const filterKeys = Object.keys(filterQuery);
    filterKeys.forEach((key) => {
      if (!allowedFilter.includes(key)) {
        const exception = new Error(`Query ${key} is not allowed!`);
        exception.statusCode = 401;
        throw exception;
      }
      if (!filterQuery[key]) delete filterQuery[key];
    });
    //processing logic
    let offset = limit * (page - 1);

    let db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    const { pokemons } = db;

    console.log(filterKeys, filterQuery);
    let result = [];
    if (type) {
      result = pokemons.filter((pokemon) => {
        return pokemon.types.includes(type);
      });
    } else result = pokemons;

    if (search) {
      result = pokemons.filter((pokemon) => pokemon.name.includes(search));
    }
    result = result.slice(offset, offset + limit);
    const response = {
      success: true,
      data: result,
    };

    //send response
    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
});

router.get("/:pokemonId", function (req, res, next) {
  const { body, params, url } = req;
  try {
    const db = JSON.parse(fs.readFileSync("db.json"));
    const { pokemons, evolutions } = db;
    if (params.pokemonId <= 0 || params.pokemonId > pokemons.length) {
      const exception = new Error(`Please provide correct Pokemon ID`);
      exception.statusCode = 401;
      throw exception;
    }
    const reqPokemon = pokemons.find(
      (pokemon) => pokemon.id === parseInt(params.pokemonId)
    );
    let previousPokemon = 0;
    // let nextPokemons = [];
    let nextPokemon = 0;
    evolutions.forEach((evo) => {
      if (evo[1] == reqPokemon.id) previousPokemon = evo[0];
      if (evo[0] == reqPokemon.id) {
        nextPokemon = evo[1];
        // nextPokemons.push(evo[1])};
      }
    });

    let result = { pokemon: reqPokemon };
    if (previousPokemon !== 0) {
      previousPokemon = pokemons.find(
        (pokemon) => pokemon.id === previousPokemon
      );
      result.previousPokemon = previousPokemon;
    }
    if (nextPokemon !== 0) {
      nextPokemon = pokemons.find((pokemon) => pokemon.id === nextPokemon);
      result.nextPokemon = nextPokemon;
    }
    // if (nextPokemons.length > 0) {
    //   nextPokemons = nextPokemons.map((nextPokemon) =>
    //     pokemons.find((pokemon) => pokemon.id === nextPokemon)
    //   );
    //   result.nextPokemons = nextPokemons;
    // }
    const response = {
      success: true,
      data: result,
    };
    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
});

router.post("/", (req, res, next) => {
  const { body, params, url, query } = req;
  //input validation
  let db = JSON.parse(fs.readFileSync("db.json"));
  console.log(body);
  try {
    if (!body.name || !body.id || !body.types) {
      const exception = new Error(`Missing required data.`);
      exception.statusCode = 401;
      throw exception;
    }
    if (body.types.length > 2) {
      const exception = new Error("Pokémon can only have one or two types.");
      exception.statusCode = 401;
      throw exception;
    }
    body.types.forEach((type) => {
      if (!db.types.includes(type)) {
        const exception = new Error("Pokémon's type is invalid.");
        exception.statusCode = 401;
        throw exception;
      }
    });
    db.pokemons.forEach((pokemon) => {
      if (
        pokemon.id === parseInt(body.id) ||
        pokemon.name === body.name.toLowerCase()
      ) {
        const exception = new Error("The Pokémon already exists.");
        exception.statusCode = 401;
        throw exception;
      }
    });

    const newPokemon = {
      id: parseInt(body.id),
      name: body.name.toLowerCase(),
      types: body.types,
      url: body.url ? body.url : "",
    };
    db.pokemons.push(newPokemon);
    fs.writeFileSync("db.json", JSON.stringify(db));
    const response = {
      success: true,
      data: newPokemon,
    };
    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
