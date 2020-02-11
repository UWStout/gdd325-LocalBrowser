import { useState, useEffect } from 'react'
import Axios from 'axios'

// Placeholder image used when a vimeo thumbnail cannot be retrieved
const PLACEHOLDER_IMAGE_URI = 'https://via.placeholder.com/640x360.png?text=Video+Not+Available'

/**
 * Custom React Hook Function to generate or asyncronously retrieve all thumbnail links. Each
 * link is part of the component's state since they may change after the async call.
 *
 * @param {object} tile Various parameters of each media tile.
 * @return {string} The URI of the thumbnail to use, or undefined if still being retrieved.
 */
export function useThumbnailLink (tile, onLinkReady) {
  const [link, setLink] = useState('*')
  useEffect(() => {
    if (link === '*') {
      if (tile.vimeoID) {
        getVimeoThumb(tile.vimeoID).then((result) => {
          tile.link = result
          setLink(result)
          if (onLinkReady) onLinkReady()
        }).catch((error) => {
          console.error(`Error while retrieving vimeo thumbnail:\n${error}`)
          setLink(PLACEHOLDER_IMAGE_URI)
          if (onLinkReady) onLinkReady()
        })
      }
      setLink(tile.link)
      if (tile.link && onLinkReady) onLinkReady()
    }
  }, [tile.vimeoID, tile.link, link, onLinkReady])
  return link
}

/**
 * Retrieve a thumbnail for a Vimeo video (usually a trailer or code evolution video)
 *
 * @param {number} videoID The official ID of a publically accessible vimeo.com video.
 * @return {Promise} A promise that will resolve to the URI of the thumbnail or a placeholder
 *                   image if it cannot be found.
 */
async function getVimeoThumb (videoID) {
  try {
    // Request list of thumbnails for the indicated video
    const response = await Axios.get(
      `https://api.vimeo.com/videos/${videoID}/pictures`, {
        headers: {
          Authorization: 'bearer 2ab55ff9d878b29954199f70288a8bde',
          Accept: 'application/vnd.vimeo.*+json;version=3.4'
        }
      })

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
    return uri
  } catch (error) {
    // Something went wrong. Log the error and return a placeholder image.
    console.error(`Failed to retrieve Vimeo thumbnail: ${error}`)
    return PLACEHOLDER_IMAGE_URI
  }
}
