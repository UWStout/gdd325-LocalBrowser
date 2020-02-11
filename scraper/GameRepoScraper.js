// Standard path and file utilities
import path from 'path'
import fs from 'fs'
import https from 'https'

// Spawning child processes
import ChildProcess from 'child_process'

// Tarball utilities
import tar from 'tar'

// Official GitHub rest api
import Octokit from '@octokit/rest'

// Config containing private access key (DO NOT COMMIT)
import CONFIG from './PrivateConfig.json'

// List of games and vital data for each
import gameList from './gameList.json'

// Global paths
const REPOS_DIR = path.join('public', 'game_repos')
const MEDIA_DIR = path.join('public', 'game_media')

// A placeholder for missing banners
const PLACEHOLDER_IMAGE_URI = 'https://dummyimage.com/536x300/fff/000.gif&text='

// Await on this function to 'sleep' for the specified milliseconds
function sleep (ms) {
  return new Promise((resolve) => { setTimeout(resolve, ms) })
}

// Instantiate and configure our Octokit REST instance
const octokit = Octokit(CONFIG);

(async () => {
  // Make sure the game_repo dir exists
  if (!fs.existsSync(REPOS_DIR)) {
    fs.mkdirSync(REPOS_DIR, { recursive: true })
  }

  // Make sure the game_media dir exists
  if (!fs.existsSync(MEDIA_DIR)) {
    fs.mkdirSync(MEDIA_DIR, { recursive: true })
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

  const gameInfoArray = []

  // Loop through and process all games
  for (let game = 0; game < gameList.length; game++) {
    if (processIndexes.size > 0 && !processIndexes.has(game)) {
      console.log('Skipping ' + gameList[game].title)
    } else {
      const safeTitle = gameList[game].title.replace(/[\.\\\[\],!?;:` /'"~+=<>(){}]/g, '_')
      let bannerLink = 'tempBanner.gif'

      // Retrieve and build the game
      try {
        await downloadGame(gameList[game].owner, gameList[game].repo, safeTitle)
        bannerLink = await copyBanner(safeTitle, gameList[game])
        if (gameList[game].install || gameList[game].scripts.length > 0) {
          buildGame(gameList[game], safeTitle)
        }
      } catch (err) {
        console.error('Error for ' + gameList[game].title + ':')
        console.error(err)
      }

      gameInfoArray.push({
        title: gameList[game].title,
        safeTitle: safeTitle,
        semester: gameList[game].semester,
        year: gameList[game].year,
        banner: path.join('game_media', bannerLink),
        playLink: path.join('game_repos', safeTitle, gameList[game].playLink)
      })
    }
  }

  // Save out all the game information
  fs.writeFileSync(
    path.join('public', 'gameList.json'),
    JSON.stringify(gameInfoArray, null, 2),
    { encoding: 'utf8' }
  )
})()

async function downloadGame (owner, repo, safeTitle) {
  // Create game archive directory
  const repoDir = path.join(REPOS_DIR, safeTitle)
  if (fs.existsSync(repoDir)) {
    console.log('Using existing data in ' + repoDir)
    return repoDir
  }

  // Get the archive download link
  console.log('Downloading game to ' + repoDir)
  console.log('\tDownloading archive ...')
  const localArchiveFile = await retrieveGithubArchive(
    owner, repo, REPOS_DIR
  )

  let archiveFolder = path.basename(localArchiveFile)
  archiveFolder = archiveFolder.slice(0, archiveFolder.indexOf('.tar.gz'))
  console.log('\tExpanding archive ...')
  if (!expandTarball(localArchiveFile, REPOS_DIR)) {
    console.error('\tError expanding archive')
    return ''
  } else {
    await sleep(5000) // Folder doesn't show up for a moment
    fs.renameSync(path.join(REPOS_DIR, archiveFolder), repoDir)
    fs.unlinkSync(localArchiveFile)
  }

  return repoDir
}

async function copyBanner (safeTitle, game) {
  // Is the banner link a full URL?
  if (game.banner && game.banner.startsWith('http')) {
    const baseBanner = path.join(MEDIA_DIR, safeTitle + '_banner')
    const extension = path.extname(game.banner)
    try {
      await downloadWebFile(game.banner, baseBanner + extension)
    } catch (err) {
      await downloadWebFile(
        PLACEHOLDER_IMAGE_URI + encodeURIComponent(game.title),
        baseBanner + '.png')
      return safeTitle + '_banner.png'
    }
    return safeTitle + '_banner' + extension
  }

  // Otherwise, assume it is in the repo
  const repoPath = path.join(REPOS_DIR, safeTitle)
  if (fs.existsSync(repoPath)) {
    const baseBanner = path.join(MEDIA_DIR, safeTitle + '_banner')
    if (game.banner && game.banner !== '') {
      const extension = path.extname(game.banner)
      fs.copyFileSync(
        path.join(repoPath, game.banner),
        baseBanner + extension
      )
      return safeTitle + '_banner' + extension
    } else {
      await downloadWebFile(
        PLACEHOLDER_IMAGE_URI + encodeURIComponent(game.title),
        baseBanner + '.png')
      return safeTitle + '_banner.png'
    }
  }

  return 'tempBanner.gif'
}

function buildGame (gameInfo, safeTitle) {
  const repoPath = path.join(REPOS_DIR, safeTitle)
  const localNMDir = path.join(repoPath, 'node_modules')

  // Process npm dependencies and scripts
  try {
    // Install node dependencies if requested
    if (gameInfo.install) {
      // Delete any old node_modules dir
      if (fs.existsSync(localNMDir)) {
        ChildProcess.execSync('rm -rf "' + localNMDir + '"')
      }

      // Install dependencies
      console.log('\tInstalling Dependencies ...')
      ChildProcess.execSync('npm install', { cwd: repoPath, stdio: 'ignore' })
    }

    // Run any npm scripts requested
    if (gameInfo.scripts && Array.isArray(gameInfo.scripts)) {
      gameInfo.scripts.forEach((scriptCmd) => {
        console.log('\tRunning ' + scriptCmd + ' script ...')
        ChildProcess.execSync('npm run "' + scriptCmd + '"', { cwd: repoPath, stdio: 'ignore' })
      })
    }

    // Delete the node_modules dir to save space
    if (fs.existsSync(localNMDir)) {
      console.log('\tCleanup ...')
      ChildProcess.execSync('rm -rf "' + localNMDir + '"')
    }

    // DISABLED: more extensive cleanup
    // const dirList = fs.readdirSync(repoPath)
    // for (const item of dirList) {
    //   const fullPath = path.join(repoPath, item)
    //   if (item !== 'index.html' && item !== 'assets' &&
    //       item !== 'dist' && item !== 'WebsiteData') {
    //     if (fs.lstatSync(fullPath).isDirectory()) {
    //       ChildProcess.execSync('rm -rf ' + fullPath)
    //     } else {
    //       fs.unlinkSync(fullPath)
    //     }
    //   }
    // }
  } catch (err) {
    console.error(err)
  }
}

function retrieveGithubArchive (owner, repo, destFolder) {
  return new Promise((resolve, reject) => {
    octokit.repos.getArchiveLink({ owner, repo, archive_format: 'tarball', ref: 'master' })
      .then((response) => {
        if (response.status !== 200) {
          reject(new Error('Bad status code for archive retrieval (' + response.status + ')'))
        }

        let filename = response.headers['content-disposition']
        filename = filename.slice(filename.indexOf('filename=') + 9)

        downloadWebFile(response.url, path.join(destFolder, filename))
          .then((localFile) => { resolve(localFile) })
          .catch((error) => {
            reject(new Error('Archive retrieval error - ' + error.message))
          })
      })
      .catch((error) => {
        reject(new Error('Archive retrieval error - ' + error.message))
      })
  })
}

async function expandTarball (filename, destDir) {
  try {
    await tar.extract({
      file: filename,
      gzip: true,
      cwd: destDir
    })
    return true
  } catch (err) {
    return false
  }
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
