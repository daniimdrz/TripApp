import { createApi } from 'unsplash-js';

const unsplash = createApi({
  accessKey: 'OBjubBEtl6ajDM36h1pxuafXPMyHWhR7AMH_7bDLoYo',
});

export async function searchCityImage(query: string): Promise<string | null> {
  try {
    const result = await unsplash.search.getPhotos({
      query: query,
      perPage: 1,
      orientation: 'landscape',
    });

    if (result.response?.results.length > 0) {
      return result.response.results[0].urls.regular;
    }

    return null;
  } catch (error) {
    console.error('Error searching Unsplash:', error);
    return null;
  }
} 