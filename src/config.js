export const TMDB_API_KEY = "e8caad2d9f38c772cf6b62242ef35237";
export const NEXSTREAM_API_KEY = "nx_5fb844c597eef26e906d08a26f9e290b";
export const NEXSTREAM_BASE_URL = "https://api.codespecters.com";

export const STREAM_SERVERS = [
  {
    id: "nexstream",
    name: "NexStream",
    description: "CodeSpecter embed",
    movieUrl: nexstreamMovieUrl,
    tvUrl: nexstreamTvUrl
  },
  {
    id: "vidsrc-me",
    name: "VidSrc Me",
    description: "External source",
    movieUrl: (tmdbId) => `https://vidsrc.me/embed/movie/${tmdbId}`,
    tvUrl: (tmdbId, seasonNumber = 1, episodeNumber = 1) =>
      `https://vidsrc.me/embed/tv/${tmdbId}/${seasonNumber}/${episodeNumber}`
  },
  {
    id: "vidsrc-to",
    name: "VidSrc To",
    description: "External source",
    movieUrl: (tmdbId) => `https://vidsrc.to/embed/movie/${tmdbId}`,
    tvUrl: (tmdbId, seasonNumber = 1, episodeNumber = 1) =>
      `https://vidsrc.to/embed/tv/${tmdbId}/${seasonNumber}/${episodeNumber}`
  },
  {
    id: "superembed",
    name: "SuperEmbed",
    description: "External source",
    movieUrl: (tmdbId) => `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
    tvUrl: (tmdbId, seasonNumber = 1, episodeNumber = 1) =>
      `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${seasonNumber}&e=${episodeNumber}`
  }
];

export function tmdbUrl(path, params = {}) {
  const url = new URL(`https://api.themoviedb.org/3${path}`);

  url.searchParams.set("api_key", TMDB_API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

export function nexstreamMovieUrl(tmdbId) {
  return `${NEXSTREAM_BASE_URL}/embed/movie/${tmdbId}?apikey=${NEXSTREAM_API_KEY}`;
}

export function nexstreamTvUrl(tmdbId, seasonNumber = 1, episodeNumber = 1) {
  return `${NEXSTREAM_BASE_URL}/embed/tv/${tmdbId}/${seasonNumber}/${episodeNumber}?apikey=${NEXSTREAM_API_KEY}`;
}
