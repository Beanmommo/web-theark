import { buildImageUrl } from 'cloudinary-build-url'

export const useCld = () =>
{
  const getURL = (publicId: string) =>
  {
    const finalPublicId = 'website/' + publicId
    return buildImageUrl(finalPublicId, {
      cloud: {
        cloudName: 'thearksg'
      }
    })
  }
  return { getURL }
}