// Standard path and file utilities
import path from 'path'
import fs from 'fs'
import https from 'https'

// Spawning child processes
import ChildProcess from 'child_process'

// Image manipulation library
import Jimp from 'jimp'

// Async request helper
import Axios from 'axios'

// Script for decoding base64 data
import atob from 'atob'

// Official GitHub rest api
import Octokit from '@octokit/rest'

// Config containing private access key (DO NOT COMMIT)
import CONFIG from './PrivateConfig.json'

// List of games and vital data for each
import gameList from './gameList.json'

// Instantiate and configure our Octokit REST instance
const octokit = Octokit(CONFIG)

const listFileData = [];

(async () => {
  // Make sure the game_media dir exists
  if (!fs.existsSync(path.join('public', 'game_media'))) {
    fs.mkdirSync(path.join('public', 'game_media'), { recursive: true })
  }

  // Arguments may be supplied that are either indexs of games to scrape
  // or strings that match the game titles.
  const processIndexes = new Set()
  if (process.argv.length > 2) {
    for (let idx = 2; idx < process.argv.length; idx++) {
      const arg = process.argv[idx]

      // Is this an integer index (zero based)?
      if (parseInt(arg) !== undefined) {
        const gameIdx = parseInt(arg)
        if (gameIdx < 0 || gameIdx >= gameList.length) {
          console.error('Invalid game index: ' + gameIdx)
        } else {
          processIndexes.add(gameIdx)
        }
      } else {
        // Assume it is a title string
        const found = gameList.findIndex((item) => {
          return (item.title === arg)
        })
        if (found !== undefined) {
          processIndexes.add(found)
        } else {
          console.error('Game not found: ' + arg)
        }
      }
    }
  }

  // Loop through and process all games
  for (let game = 0; game < gameList.length; game++) {
    // A title with unsafe file and path characters removed
    const safeTitle = gameList[game].title.replace(/[ /\\'"]/g, '_')

    // Should we retrieve all media or just data file
    let dataFileOnly = false
    if (processIndexes.size > 0 && !processIndexes.has(game)) {
      dataFileOnly = true
    }

    // Retrieve game data (and possibly all media)
    const gameData = await downloadAndProcessGameDataFile(gameList[game], safeTitle, dataFileOnly)
    const gameDataFilename = path.join('public', 'game_media', `${safeTitle}.json`)

    if (dataFileOnly) {
      console.log('\tSkipping ' + gameList[game].title + ' media')
    } else {
      // Re-write game data file with new links and name
      fs.writeFileSync(gameDataFilename, JSON.stringify(gameData), { encoding: 'UTF8' })
    }

    // Add to list of file data
    listFileData.push({
      gameTitle: gameData.title,
      gameDataURL: gameDataFilename.slice(gameDataFilename.indexOf('/') + 1),
      gameMDURL: gameData.markdownURI,
      bannerLink: gameData.bannerTitleURI,
      cols: 2
    })
  }

  // Write out the game list file
  fs.writeFileSync(
    path.join('src', 'GamePage', 'gameList.json'),
    JSON.stringify(listFileData),
    { encoding: 'UTF8' }
  )
})()

async function downloadAndProcessGameDataFile (curGame, safeTitle, dataFileOnly = false) {
  let gameData = {}
  if (!curGame.path) {
    gameData = {
      title: curGame.title,
      byline: '',
      repoOwner: curGame.owner,
      repoName: curGame.repo,
      markdownURI: 'tempMarkdown.md',
      bannerTitleURI: 'tempBanner.gif',
      media: []
    }
  } else {
    // Retrieve the game JSON data
    gameData = await retrieveGithubFile(
      curGame.owner,
      curGame.repo,
      curGame.path,
      path.join('public', 'game_media'),
      true
    )
    gameData.repoOwner = gameData.repoOwner || curGame.owner
    gameData.repoName = gameData.repoName || curGame.repo

    // Append play and download links if any
    gameData.webPlayLink = path.join('game_repo', safeTitle, 'index.html')
    gameData.windowsDownloadLink = path.join('game_builds', safeTitle + '-win64.zip')
    gameData.macOSDownloadLink = path.join('game_builds', safeTitle + '-macOS.dmg')

    // Ensure output directory exists and is empty
    const destDir = path.join('public', 'game_media', safeTitle)
    if (!dataFileOnly && fs.existsSync(destDir)) {
      ChildProcess.execSync('rm -rf ' + destDir)
      fs.mkdirSync(destDir, { recursive: true })
    }
    console.log('Retrieving data for ' + destDir)

    // Retrieve banners and Markdown
    if (gameData.bannerTitleURI) {
      const bannerFile = await retrieveMediaImage(gameData, gameData.bannerTitleURI || gameData.bannerTitle, destDir)
      if (!bannerFile) {
        console.error('Failed to retrieve banner image')
      } else {
        gameData.bannerTitleURI = bannerFile.slice(bannerFile.indexOf('/') + 1)
      }
    } else {
      console.error('Missing title banner URI')
      gameData.bannerTitleURI = 'tempBanner.gif'
    }

    if (gameData.bannerWideURI) {
      const wideBannerFile = await retrieveMediaImage(gameData, gameData.bannerWideURI || gameData.bannerWide, destDir)
      if (!wideBannerFile) {
        console.error('Failed to retrieve wide banner image')
      } else {
        gameData.bannerWideURI = wideBannerFile.slice(wideBannerFile.indexOf('/') + 1)
      }
    } else {
      console.error('Missing wide banner URI')
    }

    if (gameData.markdownURI) {
      const markdownFile = await retrieveMediaImage(gameData, gameData.markdownURI || gameData.markdown, destDir)
      if (!markdownFile) {
        console.error('Failed to retrieve markdown file')
      } else {
        gameData.markdownURI = markdownFile.slice(markdownFile.indexOf('/') + 1)
      }
    } else {
      console.error('Missing markdown file URI')
      gameData.markdownURI = 'tempMarkdown.md'
    }

    // Stop now if this is a dataonly retrieval
    if (dataFileOnly) { return gameData }

    // Retrieve all embedded media
    for (let i = 0; i < gameData.media.length; i++) {
      const media = gameData.media[i]
      let localFile = ''
      if (media.vimeoID) {
        // Vimeo thumbnail
        localFile = await downloadVimeoThumb(media.vimeoID, path.join(destDir, media.vimeoID + '.jpg'))
      } else if (media.link) {
        localFile = await retrieveMediaImage(gameData, media.link, destDir)
      }

      // Did we get something
      if (localFile) {
        if (media.vimeoID) {
          // Update just the thumbnail link
          gameData.media[i].thumb = localFile.slice(localFile.indexOf('/') + 1)
          console.log(`\tSaved: ${localFile}`)
        } else {
          // Update media link to point to local file
          gameData.media[i].link = localFile.slice(localFile.indexOf('/') + 1)
          console.log(`\tSaved: ${localFile}`)

          // Attempt to make thumbnail version and update thumb link
          const thumbFile = await resizeImage(localFile, 370)
          if (thumbFile !== '') {
            console.log(`\tSaved: ${thumbFile}`)
            gameData.media[i].thumb = thumbFile.slice(thumbFile.indexOf('/') + 1)
          } else {
            console.error('\tFailed to make thumbnail')
          }
        }
      } else {
        console.error('\tFailed to retrieve ' + media.title + ' (missing link prop? bad link?)')
      }
    }
  }

  return gameData
}

async function retrieveMediaImage (gameData, mediaLink, destDir) {
  if (mediaLink.toUpperCase().startsWith('HTTP')) {
    // General URL
    const destName = gameData.title + '_' + mediaLink.substring(mediaLink.lastIndexOf('/') + 1)
    return downloadWebFile(mediaLink, path.join(destDir, destName))
  } else {
    // Github link
    return retrieveGithubFile(gameData.repoOwner, gameData.repoName, mediaLink, destDir)
  }
}

/**
 * Proportionally resize an image file to fit entirely within the given dimensions.
 * Intended for making thumbnails. Will save the result as a 60% quality JPEG next
 * to the given image file with '_thub.jpg' appended to the filename. Returns the
 * new filename. This is an asynchronous function.
 *
 * @param {string} dilename Name of the github user or org that owns the repo
 * @param {number} targetWidth Width of the resized image.
 * @param {number} targetHeight Height of the resized image.
 * @return {Promise} Resolves to the filename of the newly generated image.
 */
function resizeImage (filename, targetWidth, targetHeight = Jimp.AUTO) {
  // Build dest filename
  let destName = path.basename(filename)
  destName = destName.slice(0, destName.lastIndexOf('.'))
  destName = path.join(path.dirname(filename), destName + '_thumb.jpg')

  // Resie the image in a promise
  return new Promise((resolve, reject) => {
    Jimp.read(filename)
      .then((loadedImage) => {
        loadedImage.resize(targetWidth, targetHeight).quality(90).write(destName)
        resolve(destName)
      })
      .catch(err => {
        reject(new Error('Image resize failed: ' + err))
      })
  })
}

/**
 * Retrieve a file from a github repo using a private access key. The file contents
 * are decoded and written to the 'public/game_media' folder. A path to the file
 * (relative to the 'public' folder) is returned.
 *
 * @param {string} owner Name of the github user or org that owns the repo
 * @param {string} repo Name of the gihub repo
 * @param {string} resourcePath Path within the repo to the file
 * @param {boolean} asObject Decode as json and return object
 * @return {object|string} If asObject is true, the file is treated as JSON and returned.
 *                         Otherwise, a string filepath to the saved data is returned.
 */
async function retrieveGithubFile (owner, repo, resourcePath, destDir, asObject = false) {
  let results = null
  try {
    // Trim off leading slashes
    while (resourcePath.startsWith('/') || resourcePath.startsWith('\\')) {
      resourcePath = resourcePath.slice(1)
    }

    // List files in that repo directory
    const pathOnly = path.dirname(resourcePath)
    const fileList = await octokit.repos.getContents({ owner, repo, path: pathOnly || '' })

    // Locate the one needed
    const whichFile = fileList.data.find((file) => {
      return (file.path === resourcePath)
    })

    // If found, retrieve that one file
    if (whichFile) {
      results = await octokit.git.getBlob({ owner, repo, file_sha: whichFile.sha })
    } else {
      throw new Error('File not found in directory list')
    }
  } catch (err) {
    console.error('\tGithub API error: ' + err)
    return undefined
  }

  // Output the results
  if (!results || results.status !== 200) {
    console.error('\tGithub request error: ' + JSON.stringify(results, null, 2))
    return undefined
  } else {
    const decodedData = atob(results.data.content)
    // Return either file or JSON decoded object
    if (!asObject) {
      // Write file to local directory
      const filename = resourcePath.replace(/\//g, '_')
      fs.writeFileSync(path.join(destDir, filename), decodedData, 'binary')
      return path.join(destDir, filename)
    } else {
      const myObject = JSON.parse(decodedData)
      return myObject
    }
  }
}

// Placeholder image used when a vimeo thumbnail cannot be retrieved
const PLACEHOLDER_IMAGE_URI = 'https://via.placeholder.com/640x360.png?text=Video+Not+Available'

/**
 * Lookup the URL of the thumbnail for the given vimeo video and download it locally to
 * the indicated destination file. Returns the local filename after download or undefined
 * if something goes wrong.
 *
 * @param {string} vimeoID String id of the desired vimeo video
 * @param {string} dest Filename to store the thumbnail locally
 * @return {Promise} Resolves to locally stored filename
 */
function downloadVimeoThumb (vimeoID, dest) {
  return new Promise((resolve, reject) => {
    getVimeoThumb(vimeoID).then((thumbURI) => {
      downloadWebFile(thumbURI, dest).then((localFile) => {
        resolve(localFile)
      }).catch((err) => { reject(err) })
    }).catch((err) => { reject(err) })
  })
}

/**
 * Retrieve a thumbnail for a Vimeo video (usually a trailer or code evolution video)
 *
 * @param {number} videoID The official ID of a publically accessible vimeo.com video.
 * @return {Promise} A promise that will resolve to the URI of the thumbnail or a placeholder
 *                   image if it cannot be found.
 */
function getVimeoThumb (videoID) {
  return new Promise((resolve) => {
    // Request list of thumbnails for the indicated video
    Axios.get(`https://api.vimeo.com/videos/${videoID}/pictures`, {
      headers: {
        Authorization: 'bearer 2ab55ff9d878b29954199f70288a8bde',
        Accept: 'application/vnd.vimeo.*+json;version=3.4'
      }
    }).then((response) => {
      // Search through returned data for the correct size and extract URI
      let uri = ''
      for (let i = 0; i < response.data.data[0].sizes.length; i++) {
        if (parseInt(response.data.data[0].sizes[i].width) === 640) {
          uri = response.data.data[0].sizes[i].link_with_play_button
          break
        }
      }

      // Did we find the correct size?
      if (uri === '') {
        throw new Error('Correct size not found')
      }

      // Return the found URI
      resolve(uri)
    }).catch((error) => {
      // Something went wrong. Log the error and return a placeholder image.
      console.error(`\tFailed to retrieve Vimeo thumbnail: ${error}`)
      resolve(PLACEHOLDER_IMAGE_URI)
    })
  })
}

/**
 * Download and save a file from the web (async).
 * @param {string} URI The link to the file to download.
 * @param {string} dest The local filename to write to.
 * @return {Promise} A promise the resolves to the name of the locally written file.
 */
function downloadWebFile (URI, dest) {
  return new Promise((resolve, reject) => {
    // Open destination file for writing
    const file = fs.createWriteStream(dest)

    // Retrieve file contents
    https.get(URI, (response) => {
      // Pipe everything to the file
      response.pipe(file)

      // Close file and resolve when finished
      file.on('finish', () => {
        file.close()
        resolve(dest)
      })
    }).on('error', (err) => {
      // Delete file and reject the promise
      fs.unlink(dest)
      reject(err)
    })
  })
}
