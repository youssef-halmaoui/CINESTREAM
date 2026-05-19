import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { tmdbUrl } from "../config";
import { getCurrentUser, isFavorite, toggleFavorite } from "../services/auth";
import "./TVDetails.css";

function TVDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [activeSeasonNumber, setActiveSeasonNumber] = useState(null);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [error, setError] = useState("");
  const [currentUser] = useState(() => getCurrentUser());
  const [favoriteSaved, setFavoriteSaved] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("Series details could not be loaded.");
      return;
    }

    setShow(null);
    setSeasons([]);
    setError("");
    setLoadingEpisodes(true);

    axios
      .get(tmdbUrl(`/tv/${id}`))
      .then((showRes) => {
        const showData = showRes.data;
        const visibleSeasons = (showData.seasons || []).filter(
          (season) => season.season_number > 0
        );

        setShow(showData);
        setFavoriteSaved(currentUser ? isFavorite(currentUser.id, showData.id) : false);

        return Promise.all(
          visibleSeasons.map((season) =>
            axios
              .get(tmdbUrl(`/tv/${id}/season/${season.season_number}`))
              .then((seasonRes) => seasonRes.data)
              .catch(() => ({ ...season, episodes: [] }))
          )
        );
      })
      .then((seasonResults) => {
        const loadedSeasons = seasonResults || [];
        setSeasons(loadedSeasons);
        setActiveSeasonNumber(loadedSeasons[0]?.season_number || null);
      })
      .catch(() => {
        setError("Series details could not be loaded.");
      })
      .finally(() => {
        setLoadingEpisodes(false);
      });
  }, [currentUser, id]);

  if (error) {
    return (
      <div className="tv-message">
        <p>{error}</p>
        <Link to="/Movies">Back to browse</Link>
      </div>
    );
  }

  if (!show) {
    return <p className="tv-message">Loading series...</p>;
  }

  const backdropPath = show.backdrop_path || show.poster_path;
  const firstYear = show.first_air_date ? show.first_air_date.slice(0, 4) : "Now";
  const episodeCount = seasons.reduce((total, season) => total + (season.episodes?.length || 0), 0);
  const activeSeason = seasons.find((season) => season.season_number === activeSeasonNumber) || seasons[0];

  function handleFavoriteClick() {
    if (!currentUser) {
      navigate("/Login");
      return;
    }

    const updatedFavorites = toggleFavorite(currentUser.id, {
      id: show.id,
      mediaType: "tv",
      name: show.name,
      poster_path: show.poster_path,
      backdrop_path: show.backdrop_path
    });

    setFavoriteSaved(updatedFavorites.some((item) => String(item.id) === String(show.id)));
  }

  return (
    <div className="tv-page">
      <header className="tv-header">
        <Link to="/Movies" className="tv-brand">CINESTREAM</Link>
        <nav className="tv-nav" aria-label="Main navigation">
          <Link to="/Movies">Browse</Link>
          {currentUser && <Link to="/Movies#favorites">My List</Link>}
          <Link to={`/TV/${id}/Details`} className="active">Series</Link>
        </nav>
      </header>

      <main className="tv-main">
        <section
          className="tv-hero"
          style={{
            backgroundImage: backdropPath
              ? `linear-gradient(90deg, rgba(10, 10, 12, 0.92), rgba(10, 10, 12, 0.36)), linear-gradient(0deg, #111 0%, rgba(17, 17, 17, 0.1) 42%), url(https://image.tmdb.org/t/p/original${backdropPath})`
              : undefined
          }}
        >
          <div className="tv-hero-content">
            <div className="tv-tags">
              <span>Series</span>
              <span>{firstYear}</span>
              <span>{seasons.length} seasons</span>
              <span>{episodeCount || show.number_of_episodes || 0} episodes</span>
              {show.vote_average && <span>Star {show.vote_average.toFixed(1)}</span>}
            </div>
            <h1>{show.name}</h1>
            <p>{show.overview || "No overview available for this series."}</p>
            <button
              type="button"
              className="tv-watch-button"
              onClick={() => navigate(`/TV/${id}/Season/1/Episode/1/Watch`)}
            >
              Watch S1 E1
            </button>
            <button
              type="button"
              className="tv-favorite-button"
              onClick={handleFavoriteClick}
            >
              {currentUser
                ? favoriteSaved ? "✓ In Favorite List" : "+ Add to Favorite List"
                : "Sign in to Favorite"}
            </button>
          </div>
        </section>

        {loadingEpisodes && <p className="tv-loading">Loading episodes...</p>}

        <section className="tv-seasons" aria-label="Seasons and episodes">
          <div className="seasons-panel-heading">
            <h2>Seasons and episodes</h2>
            {activeSeason && <span>{activeSeason.episodes?.length || 0} episodes</span>}
          </div>

          <div className="season-tabs" aria-label="Choose season">
            {seasons.map((season) => (
              <button
                type="button"
                className={season.season_number === activeSeason?.season_number ? "active" : ""}
                key={season.id || season.season_number}
                onClick={() => setActiveSeasonNumber(season.season_number)}
              >
                Season {season.season_number}
              </button>
            ))}
          </div>

          {activeSeason?.overview && <p className="season-overview">{activeSeason.overview}</p>}

          <div className="episode-grid">
            {(activeSeason?.episodes || []).map((episode) => (
              <button
                type="button"
                className="episode-card"
                key={episode.id || episode.episode_number}
                onClick={() =>
                  navigate(`/TV/${id}/Season/${activeSeason.season_number}/Episode/${episode.episode_number}/Watch`)
                }
              >
                <div className="episode-art">
                  {episode.still_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w780${episode.still_path}`}
                      alt={episode.name}
                    />
                  ) : (
                    <div className="episode-placeholder">EP {episode.episode_number}</div>
                  )}
                  <span>Ep {episode.episode_number}</span>
                </div>
                <div className="episode-copy">
                  <strong>{episode.name || `Episode ${episode.episode_number}`}</strong>
                  <small>
                    {episode.air_date || "Air date unavailable"}
                    {episode.runtime ? ` • ${episode.runtime} min` : ""}
                  </small>
                  <p>{episode.overview || "No episode overview available."}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default TVDetails;
