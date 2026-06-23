import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { STREAM_SERVERS, tmdbUrl } from "../config";
import SiteLogo from "./SiteLogo";
import "./StreamingPage.css";

function StreamingPage() {
  const { id, seasonNumber, episodeNumber } = useParams();
  const navigate = useNavigate();
  const [media, setMedia] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [seasonEpisodes, setSeasonEpisodes] = useState([]);
  const [activeServerId, setActiveServerId] = useState(STREAM_SERVERS[0].id);
  const [error, setError] = useState("");
  const isEpisode = Boolean(seasonNumber && episodeNumber);

  useEffect(() => {
    if (!id) {
      setError("Stream could not be loaded.");
      return;
    }

    setMedia(null);
    setRecommendations([]);
    setSeasonEpisodes([]);
    setError("");

    const detailsUrl = isEpisode
      ? tmdbUrl(`/tv/${id}/season/${seasonNumber}/episode/${episodeNumber}`)
      : tmdbUrl(`/movie/${id}`);
    const recommendationsUrl = isEpisode
      ? tmdbUrl(`/tv/${id}/recommendations`)
      : tmdbUrl(`/movie/${id}/recommendations`);
    const seasonUrl = isEpisode ? tmdbUrl(`/tv/${id}/season/${seasonNumber}`) : null;

    axios
      .all([
        axios.get(detailsUrl),
        axios.get(recommendationsUrl),
        seasonUrl
          ? axios.get(seasonUrl).catch(() => ({ data: { episodes: [] } }))
          : Promise.resolve({ data: { episodes: [] } })
      ])
      .then(axios.spread((detailsRes, recommendationsRes, seasonRes) => {
        setMedia(detailsRes.data);
        setRecommendations(recommendationsRes.data.results || []);
        setSeasonEpisodes(seasonRes.data.episodes || []);
      }))
      .catch(() => {
        setError("Stream could not be loaded.");
      });
  }, [id, isEpisode, seasonNumber, episodeNumber]);

  if (error) {
    return (
      <div className="stream-message">
        <p>{error}</p>
        <Link to="/Movies">Back to movies</Link>
      </div>
    );
  }

  if (!media) {
    return <p className="stream-message">Loading stream...</p>;
  }

  const title = media.title || media.name;
  const releaseDate = media.release_date || media.air_date;
  const releaseYear = releaseDate ? releaseDate.slice(0, 4) : "Now";
  const runtimeHours = Math.floor((media.runtime || 0) / 60);
  const runtimeMinutes = (media.runtime || 0) % 60;
  const runtimeText = media.runtime ? `${runtimeHours}h ${runtimeMinutes}m` : "Runtime unavailable";
  const currentEpisodeNumber = Number(episodeNumber);
  const currentEpisodeIndex = seasonEpisodes.findIndex(
    (episode) => episode.episode_number === currentEpisodeNumber
  );
  const previousEpisode = currentEpisodeIndex > 0 ? seasonEpisodes[currentEpisodeIndex - 1] : null;
  const nextEpisode =
    currentEpisodeIndex >= 0 && currentEpisodeIndex < seasonEpisodes.length - 1
      ? seasonEpisodes[currentEpisodeIndex + 1]
      : null;
  const activeServer =
    STREAM_SERVERS.find((server) => server.id === activeServerId) || STREAM_SERVERS[0];
  const streamUrl = isEpisode
    ? activeServer.tvUrl(id, seasonNumber, episodeNumber)
    : activeServer.movieUrl(id);

  return (
    <div className="stream-page">
      <header className="stream-header">
        <Link to="/Movies" className="stream-brand">
          <SiteLogo />
        </Link>
        <nav className="stream-nav" aria-label="Main navigation">
          <Link to="/Movies">Movies</Link>
          {!isEpisode && <Link to={`/Movies/${media.id}/Details`}>Details</Link>}
          <Link to={isEpisode ? `/TV/${id}/Season/${seasonNumber}/Episode/${episodeNumber}/Watch` : `/Movies/${media.id}/Watch`} className="active">Watch</Link>
        </nav>
      </header>

      <main className="stream-main">
        <section className="stream-player-section">
          <div className="stream-player-wrap">
            <div className="stream-player">
              <iframe
                key={activeServer.id}
                src={streamUrl}
                title={`${title} stream`}
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
            {isEpisode && (
              <div className="episode-nav-buttons" aria-label="Episode navigation">
                <button
                  type="button"
                  className="episode-nav-button prev"
                  disabled={!previousEpisode}
                  onClick={() =>
                    previousEpisode &&
                    navigate(`/TV/${id}/Season/${seasonNumber}/Episode/${previousEpisode.episode_number}/Watch`)
                  }
                >
                  <span>Prev</span>
                  <strong aria-hidden="true">&laquo;</strong>
                </button>
                <button
                  type="button"
                  className="episode-nav-button next"
                  disabled={!nextEpisode}
                  onClick={() =>
                    nextEpisode &&
                    navigate(`/TV/${id}/Season/${seasonNumber}/Episode/${nextEpisode.episode_number}/Watch`)
                  }
                >
                  <strong aria-hidden="true">&raquo;</strong>
                  <span>Next</span>
                </button>
              </div>
            )}
          </div>

          <div className="stream-info">
            <div className="stream-kicker">
              <span>Streaming</span>
              <span>{releaseYear}</span>
              <span>{runtimeText}</span>
              {media.vote_average && <span>Star {media.vote_average.toFixed(1)}</span>}
              {isEpisode && <span>S{seasonNumber} E{episodeNumber}</span>}
            </div>
            <h1>{title}</h1>
            <p>{media.overview || "No overview available for this title."}</p>
            <div className="stream-source-summary">
              <strong>{activeServer.name}</strong>
              <span>Streaming through {activeServer.description} using TMDB ID {id}.</span>
            </div>
          </div>
        </section>

        <section className="stream-section server-section">
          <div className="server-heading">
            <h2>Automatic servers</h2>
            <p>External sources generated automatically.</p>
          </div>
          <div className="server-grid">
            {STREAM_SERVERS.map((server) => (
              <button
                type="button"
                className={server.id === activeServerId ? "server-card active" : "server-card"}
                key={server.id}
                onClick={() => setActiveServerId(server.id)}
              >
                <span className="server-play" aria-hidden="true">Play</span>
                <strong>{server.name}</strong>
              </button>
            ))}
          </div>
        </section>

        {isEpisode && (
          <section className="stream-section episode-list-section">
            <div className="episode-list-heading">
              <h2>All episodes</h2>
              <span>Season {seasonNumber}</span>
            </div>
            <div className="watch-episode-grid">
              {seasonEpisodes.map((episode) => (
                <button
                  type="button"
                  className={
                    episode.episode_number === currentEpisodeNumber
                      ? "watch-episode-card active"
                      : "watch-episode-card"
                  }
                  key={episode.id || episode.episode_number}
                  onClick={() =>
                    navigate(`/TV/${id}/Season/${seasonNumber}/Episode/${episode.episode_number}/Watch`)
                  }
                >
                  <div className="watch-episode-art">
                    {episode.still_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${episode.still_path}`}
                        alt={episode.name || `Episode ${episode.episode_number}`}
                      />
                    ) : (
                      <span>Episode {episode.episode_number}</span>
                    )}
                    <strong>Ep {episode.episode_number}</strong>
                  </div>
                  <div className="watch-episode-copy">
                    <h3>{episode.name || `Episode ${episode.episode_number}`}</h3>
                    <p>{episode.overview || "No episode overview available."}</p>
                  </div>
                </button>
              ))}
              {seasonEpisodes.length === 0 && (
                <p className="stream-empty">No episodes available for this season.</p>
              )}
            </div>
          </section>
        )}

        <section className="stream-section">
          <h2>Watch Next</h2>
          <div className="stream-grid">
            {recommendations.slice(0, 6).map((item) => (
              <button
                type="button"
                className="stream-card"
                key={item.id}
                onClick={() => navigate(isEpisode ? `/TV/${item.id}/Season/1/Episode/1/Watch` : `/Movies/${item.id}/Watch`)}
              >
                <img
                  src={
                    item.backdrop_path
                      ? `https://image.tmdb.org/t/p/w500${item.backdrop_path}`
                      : `https://image.tmdb.org/t/p/w342${item.poster_path}`
                  }
                  alt={item.title || item.name}
                />
                <strong>{item.title || item.name}</strong>
                <span>{item.release_date || item.first_air_date ? (item.release_date || item.first_air_date).slice(0, 4) : "Soon"}</span>
              </button>
            ))}
            {recommendations.length === 0 && (
              <p className="stream-empty">No recommendations available yet.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default StreamingPage;
