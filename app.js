const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
const dbpath = path.join(__dirname, 'cricketTeam.db')

app.use(express.json())

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log('DB Error is ${e.message}')
    process.exit(1)
  }
}

initializeDBAndServer()

const convertDbobject = objectItem => {
  return {
    playerId: objectItem.player_id,
    playerName: objectItem.player_name,
    jersyNumber: objectItem.jersy_number,
    role: objectItem.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
    SELECT * FROM cricket_team;
    `
  const playersArray = await db.all(getPlayersQuery)
  response.send(playersArray.map(eachPlayer => convertDbobject(eachPlayer)))
})

app.post('/players/', async (request, response) => {
  const {playerName, jersyNumber, role} = request.body
  const addPlayersQuery = `
    INSERT INTO  cricket_team(player_name,jersy_number,role)
    VALUES('${playerName}',${jersyNumber},'${role}');
    `
  const dbResponse = await db.run(addPlayersQuery)
  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
    SELECT * FROM cricket_team
    WHERE player_id=${playerId};
    `
  const player = await db.get(getPlayerQuery)
  response.send(convertDbobject(player))
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName, jersyNumber, role} = request.body
  const updatedQuery = `
    UPDATE 
    cricket_team
    SET 
    player_name='${playerName}',
    jersy_number=${jersyNumber},
    role='${role}'
    WHERE 
    player_id=${playerId};
    `
  await db.run(updatedQuery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
       DELETE FROM cricket_team
       WHERE player_id=${playerId}`

  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
