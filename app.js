const express = require("express");
const app = express();

const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

module.exports = app;

//GET Players API
app.get("/players/", async (request, response) => {
  let getPlayersQuery = `
        SELECT 
            * 
        FROM 
            cricket_team
        ORDER BY 
            player_id;`;

  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };

  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//POST Adding Player API
app.post("/players/", async (request, response) => {
  let playerDetails = request.body;
  let { playerName, jerseyNumber, role } = playerDetails;

  let addPlayersQuery = `
        INSERT INTO 
            cricket_team (player_name, jersey_number, role)
        VALUES
            (
                '${playerName}',
                 ${jerseyNumber},
                '${role}'
            );`;

  let dbResponse = await db.run(addPlayersQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

//GET Player API
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const getPlayerQuery = `
        SELECT
            *
        FROM
            cricket_team
        WHERE
            player_id = ${playerId};`;

  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };

  const dbResponse = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(dbResponse));
  
});

//PUT Updating Player API
app.put("/players/:playerId", async (request, response) => {
  let playerDetails = request.body;
  const { playerId } = request.params;

  let { playerName, jerseyNumber, role } = playerDetails;

  let updatePlayersQuery = `
        UPDATE
            cricket_team
        SET
            player_name = '${playerName}',
            jersey_number = ${jerseyNumber},
            role = '${role}'
        WHERE 
            player_id = ${playerId};`;

  await db.run(updatePlayersQuery);
  response.send("Player Details Updated");
});

//DELETE Deleting Player API
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const deletePlayerQuery = `
        DELETE FROM
            cricket_team
        WHERE 
            player_id = ${playerId};`;

  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});