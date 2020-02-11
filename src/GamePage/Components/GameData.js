// Placeholder images if needed
const GENERIC_PLACEHOLDER_THUMB_LINK = 'https://via.placeholder.com/370x200.png?text=Image+Not+Available'
const GENERIC_PLACEHOLDER_LINK = 'https://via.placeholder.com/640x360.png?text=Image+Not+Available'
const WIDE_PLACEHOLDER_LINK = 'https://via.placeholder.com/900x180.png?text=Not+Found'

export default class GameData {
  constructor (title, byLine, bannerWide, webPlayLink, windowsDownloadLink, macOSDownloadLink) {
    this.title = title || 'None'
    this.byLine = byLine || ''
    this.bannerWide = bannerWide || ''
    this.media = []

    this.webPlayLink = webPlayLink
    this.windowsDownloadLink = windowsDownloadLink
    this.macOSDownloadLink = macOSDownloadLink
  }

  mediaDoneLoading () {
    // Search for any media item with an undefined link property
    const badMedia = this.media.find((curMedia) => {
      return (curMedia.link === undefined)
    })

    // If nothing was found, all media is ready
    return (badMedia === undefined)
  }

  addMediaVideo (title, videoID, thumbLink, altText) {
    const newMedia = {
      type: 'video',
      title: title || 'Unknown',
      vimeoID: videoID || '00000000',
      thumb: thumbLink, // Undefined is okay
      alt: altText || 'Placeholder Video'
    }
    this.media.push(newMedia)
  }

  addMediaImage (title, imageLink, thumbLink, altText) {
    const newMedia = {
      type: 'image',
      title: title || 'Unknown',
      thumb: thumbLink || GENERIC_PLACEHOLDER_THUMB_LINK,
      link: imageLink || GENERIC_PLACEHOLDER_LINK,
      alt: altText || 'Placeholder Image'
    }
    this.media.push(newMedia)
  }

  // Factory method to make a real game data class from an unstructured JS object
  static buildFromProto (myData) {
    const newGameData = new GameData(
      myData.title, myData.byLine, myData.bannerWide || myData.bannerWideURI,
      myData.webPlayLink, myData.windowsDownloadLink, myData.macOSDownloadLink
    )

    if (myData.media) {
      myData.media.forEach((mediaData) => {
        if (mediaData.type === 'video' || mediaData.vimeoID) {
          newGameData.addMediaVideo(mediaData.title, mediaData.vimeoID, mediaData.thumb, mediaData.alt)
        } else {
          newGameData.addMediaImage(mediaData.title, mediaData.link, mediaData.thumb, mediaData.alt)
        }
      })
    }

    return newGameData
  }
}

// Create a placeholder 'null' gameData object
GameData.NULL_GAME = GameData.buildFromProto(
  {
    title: 'NullGame',
    byLine: 'This is the null game data',
    bannerWide: WIDE_PLACEHOLDER_LINK,
    media: [
      { type: 'video', title: 'Game Trailer' },
      { title: 'Screenshot 1' },
      { title: 'Screenshot 2' },
      { title: 'Screenshot 3' },
      { title: 'Screenshot 4' },
      { title: 'Screenshot 5' }
    ]
  }
)
