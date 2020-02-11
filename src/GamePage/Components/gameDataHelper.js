import { useState, useEffect } from 'react'
import Axios from 'axios'

import GameData from './GameData'

export function useJSON (JSONDataURL, defaultObject) {
  // Default to empty object
  defaultObject = defaultObject || {}

  // The JSON object (part of the current component's state)
  const [JSONObject, setJSONObject] = useState('*')

  // Side effect to make the ajax call to retrieve the JSON object when the current component is mounted
  useEffect(() => {
    // An empty URI will simply return an empty object
    if (JSONDataURL === '') {
      setJSONObject(defaultObject)
    } else {
      // Attempt an ajax call to load the JSON file
      if (JSONObject === '*') {
        try {
          Axios.get(JSONDataURL, { responseType: 'json' }).then((result) => {
            setJSONObject(result.data)
          }).catch((error) => {
            // Something went wrong with the AJAX call so log it and return an empty object
            console.error(`AJAX request failed - ${error}`)
            setJSONObject(defaultObject)
          })
        } catch (error) {
          // Something non-ajax related went wrong so log it and return an empty object
          console.error(`Failed to retrieve json data - ${error}`)
          setJSONObject(defaultObject)
        }

        setJSONObject('wait')
      }
    }
  }, [JSONObject, defaultObject, JSONDataURL, setJSONObject])

  // Return the current state of the JSON object
  if (JSONObject === '*') { return 'wait' }
  return JSONObject
}

export function useGame (gameDataURL) {
  const [game, setGame] = useState(null)
  useEffect(() => {
    if (gameDataURL) {
      try {
        Axios.get(gameDataURL).then((result) => {
          setGame(GameData.buildFromProto(result.data))
        }).catch((error) => {
          console.error(`AJAX request failed - ${error}`)
          setGame(GameData.NULL_GAME)
        })
      } catch (error) {
        // Something went wrong. Log the error and return empty object.
        console.error(`Failed to retrieve game data - ${error}`)
        setGame(GameData.NULL_GAME)
      }
    }
  }, [gameDataURL, setGame])
  return game
}

export function useArchives () {
  const [archives, setArchives] = useState(null)
  useEffect(() => {
    try {
      Axios.get('./archivesData.json').then((result) => {
        setArchives(result.data)
      }).catch((error) => {
        console.error(`AJAX request failed: ${error}`)
        setArchives([])
      })
    } catch (error) {
      // Something went wrong. Log the error and return empty array.
      console.error(`Failed to retrieve archives data: ${error}`)
      setArchives([])
    }
  }, [setArchives])
  return archives
}

export function useGameMarkdown (gameMDDataURL) {
  const [gameMD, setGameMD] = useState(null)
  useEffect(() => {
    try {
      Axios.get(gameMDDataURL, { responseType: 'text' }).then((result) => {
        setGameMD(result.data)
      }).catch((error) => {
        console.error(`AJAX request failed - ${error}`)
        setGameMD('')
      })
    } catch (error) {
      // Something went wrong. Log the error and return empty object.
      console.error(`Failed to retrieve game data - ${error}`)
      setGameMD('')
    }
  }, [gameMDDataURL, setGameMD])
  return gameMD
}
