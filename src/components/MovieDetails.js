import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { tmdbUrl } from "../config";
import { getCurrentUser, isFavorite, toggleFavorite } from "../services/auth";
import SiteLogo from "./SiteLogo";
import "./MovieDetails.css";

function getRatingColor(rating) {
  if (rating >= 8) {
    return "#22c55e";
  }

  if (rating >= 6) {
    return "#06b6d4";
  }

  return "#f97316";
}

function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [Cast,SetCast] = useState([]);
  const [Trailler,SetTrailler] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState("");
  const [currentUser] = useState(() => getCurrentUser());
  const [favoriteSaved, setFavoriteSaved] = useState(false);
  const trailerSectionRef = useRef(null);

  useEffect(() => {
    if (!id) {
      setError("Movie details could not be loaded.");
      return;
    }

    axios
      .get(tmdbUrl(`/movie/${id}`))
      .then((res) => {
        setMovie(res.data);
        setFavoriteSaved(currentUser ? isFavorite(currentUser.id, res.data.id) : false);
        setShowTrailer(false);
        setError("");
      })
      .catch(() => {
        setError("Movie details could not be loaded.");
      });
  }, [currentUser, id]);

  useEffect(()=>{
    if (!id) {
      return;
    }

    axios 
        .get(tmdbUrl(`/movie/${id}/credits`))
        .then((res)=>{
            SetCast(res.data.cast)
        })
        .catch(() => {
            SetCast([]);
        });
  },[id])

  useEffect(() => {
    if (showTrailer) {
      trailerSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }, [showTrailer]);

  useEffect(()=>{
    if (!id) {
      return;
    }

    axios
      .get(tmdbUrl(`/movie/${id}/videos`))
      .then((res)=>{
        SetTrailler(res.data.results || []);
      })
      .catch(() => {
        SetTrailler([]);
      });
  },[id])

  useEffect(()=>{
    if (!id) {
      return;
    }

    axios
      .get(tmdbUrl(`/movie/${id}/recommendations`))
      .then((res) => {
        const results = res.data.results || [];

        if (results.length > 0) {
          setRecommendations(results);
          return;
        }

        return axios
          .get(tmdbUrl(`/movie/${id}/similar`))
          .then((similarRes) => {
            setRecommendations(similarRes.data.results || []);
          });
      })
      .catch(() => {
        setRecommendations([]);
      });
  },[id])

  if (error) {
    return (
      <div className="details-error">
        <p>{error}</p>
        <Link to="/Movies">Back to movies</Link>
      </div>
    );
  }

  if (!movie) {
    return <p className="details-loading">Loading...</p>;
  }

  const releaseYear = movie.release_date ? movie.release_date.slice(0, 4) : "Now";
  const runtimeHours = Math.floor((movie.runtime || 0) / 60);
  const runtimeMinutes = (movie.runtime || 0) % 60;
  const runtimeText = movie.runtime ? `${runtimeHours}h ${runtimeMinutes}m` : "Runtime unavailable";
  const releaseDate = movie.release_date
    ? new Date(movie.release_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    : "Coming soon";
  const backdropPath = movie.backdrop_path || movie.poster_path;
  const trailerVideo = Trailler?.find((video) => (
    video.site === "YouTube" && video.type === "Trailer"
  )) || Trailler?.find((video) => video.site === "YouTube");
  function handleCardMouseMove(event) {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    card.classList.add("is-hovering");
    card.style.setProperty("--rotate-x", `${-y * 26}deg`);
    card.style.setProperty("--rotate-y", `${x * 26}deg`);
    card.style.setProperty("--image-x", `${-x * 52}px`);
    card.style.setProperty("--image-y", `${-y * 52}px`);
  }

  function handleCardMouseLeave(event) {
    const card = event.currentTarget;

    card.classList.remove("is-hovering");
    card.style.setProperty("--rotate-x", "0deg");
    card.style.setProperty("--rotate-y", "0deg");
    card.style.setProperty("--image-x", "0px");
    card.style.setProperty("--image-y", "0px");
  }

  function handleFavoriteClick() {
    if (!currentUser) {
      navigate("/Login");
      return;
    }

    const updatedFavorites = toggleFavorite(currentUser.id, {
      id: movie.id,
      mediaType: "movie",
      title: movie.title,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path
    });

    setFavoriteSaved(updatedFavorites.some((item) => String(item.id) === String(movie.id)));
  }

  return (
    <div className="details-page">
      <header className="details-header">
        <Link to="/Movies" className="details-brand">
          <SiteLogo />
        </Link>
        <nav className="details-nav" aria-label="Main navigation">
          <Link to="/Movies" className="active">Home</Link>
          <Link to="/Movies">Movies</Link>
          <Link to="/Movies">TV Shows</Link>
          {currentUser && <Link to="/Movies#favorites">My List</Link>}
        </nav>
        <div className="details-actions">
          <button type="button" aria-label="Search">S</button>
          <button type="button" aria-label="Profile">P</button>
        </div>
      </header>

      <main className="details-main">
        <section
          className="details-hero"
          style={{
            backgroundImage: backdropPath
              ? `linear-gradient(90deg, rgba(14, 14, 14, 0.86) 0%, rgba(14, 14, 14, 0.42) 48%, rgba(14, 14, 14, 0.76) 100%), linear-gradient(0deg, #111 0%, rgba(17, 17, 17, 0.15) 42%, rgba(17, 17, 17, 0) 100%), url(https://image.tmdb.org/t/p/original${backdropPath})`
              : undefined
          }}
        >
          <div className="details-hero-content">
            <div className="details-tags">
              <span className="rating-pill">Star {movie.vote_average?.toFixed(1)}</span>
              <span className="date-pill">{releaseDate}</span>
              <span className="date-pill">{releaseYear}</span>
              <span className="date-pill">{runtimeText}</span>
              {movie.genres?.slice(0, 3).map((genre) => (
                <span className="genre-pill" key={genre.id}>{genre.name}</span>
              ))}
            </div>
            <h1>{movie.title}</h1>
            <p>{movie.overview}</p>
            <div className="details-buttons">
              <button
                type="button"
                className="watch-button"
                onClick={() => navigate(`/Movies/${movie.id}/Watch`)}
              >
                Watch Movie
              </button>
              <button
                type="button"
                className="trailer-button"
                onClick={() => setShowTrailer(true)}
                disabled={!trailerVideo}
              >
                Play Trailer
              </button>
              <button type="button" className="watchlist-button" onClick={handleFavoriteClick}>
                {currentUser
                  ? favoriteSaved ? "✓ In Favorite List" : "+ Add to Favorite List"
                  : "Sign in to Favorite"}
              </button>
            </div>
          </div>
        </section>

        {showTrailer && (
          <section className="details-section trailer-section" ref={trailerSectionRef}>
            <div className="trailer-heading">
              <h2>Trailer</h2>
              <button type="button" onClick={() => setShowTrailer(false)}>Close</button>
            </div>
            {trailerVideo ? (
              <div className="trailer-frame">
                <iframe
                  src={`https://www.youtube.com/embed/${trailerVideo.key}`}
                  title={`${movie.title} trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <p className="no-trailer">No trailer available for this movie.</p>
            )}
          </section>
        )}

        <section className="details-section">
          <h2>Top Cast</h2>
          <div className="cast-row">
            {Cast.map((actor) => (
              <article className="cast-card" key={actor.cast_id || actor.credit_id}>
                {actor.profile_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                    alt={actor.name}
                  />
                ) : (
                  <div className="cast-placeholder">{actor.name.slice(0, 1)}</div>
                )}
                <strong>{actor.name}</strong>
                <span>{actor.character}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="details-section">
          <h2>More Like This</h2>
          <div className="more-row">
            {recommendations.slice(0, 4).map((item) => (
              <button
                type="button"
                className="more-card"
                key={item.id}
                onClick={() => navigate(`/Movies/${item.id}/Details`)}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <div className="more-card-frame">
                  <img
                    src={
                      item.poster_path
                        ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
                        : `https://image.tmdb.org/t/p/w500${item.backdrop_path}`
                    }
                    alt={item.title}
                  />
                  <div className="more-card-badges">
                    <span>{item.release_date ? item.release_date.slice(0, 4) : "Soon"}</span>
                    <span style={{ backgroundColor: getRatingColor(item.vote_average || 0) }}>
                      {(item.vote_average || 0).toFixed(1)}
                    </span>
                  </div>
                </div>
                <strong>{item.title}</strong>
                <small>{item.release_date || "Release date unavailable"}</small>
              </button>
            ))}
            {recommendations.length === 0 && (
              <p className="no-recommendations">No similar movies available.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default MovieDetails;
