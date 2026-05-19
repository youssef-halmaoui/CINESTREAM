import axios from "axios";
import { useCallback, useState, useEffect, useRef } from "react";
import { useNavigate , Link} from "react-router-dom";
import { tmdbUrl } from "../config";
import { getCurrentUser, getFavorites, logoutUser } from "../services/auth";
import "./MoviesList.css";

const movieGenres = [
  { id: "", name: "All Genres" },
  { id: "28", name: "Action" },
  { id: "12", name: "Adventure" },
  { id: "16", name: "Animation" },
  { id: "35", name: "Comedy" },
  { id: "80", name: "Crime" },
  { id: "18", name: "Drama" },
  { id: "14", name: "Fantasy" },
  { id: "27", name: "Horror" },
  { id: "10749", name: "Romance" },
  { id: "878", name: "Sci-Fi" },
  { id: "53", name: "Thriller" }
];

const tvGenres = [
  { id: "", name: "All Genres" },
  { id: "10759", name: "Action & Adventure" },
  { id: "16", name: "Animation" },
  { id: "35", name: "Comedy" },
  { id: "80", name: "Crime" },
  { id: "18", name: "Drama" },
  { id: "10751", name: "Family" },
  { id: "9648", name: "Mystery" },
  { id: "10765", name: "Sci-Fi & Fantasy" }
];

function getRatingColor(rating) {
  if (rating >= 8) {
    return "#22c55e";
  }

  if (rating >= 6) {
    return "#06b6d4";
  }

  return "#f97316";
}

function MoviesList() {
  const [Movies, SetMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [mediaType, setMediaType] = useState("movie");
  const [category, setCategory] = useState("discover");
  const [genre, setGenre] = useState("");
  const [browseError, setBrowseError] = useState("");
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const didMountSearchRef = useRef(false);
  const navigate = useNavigate();
  const favorites = currentUser ? getFavorites(currentUser.id) : [];
  const heroMovie = Movies[0];
  const trendingMovies = Movies.slice(1, 6);
  const popularMovies = Movies.slice(6);
  const isTv = mediaType === "tv";
  const activeGenres = isTv ? tvGenres : movieGenres;
  const titleLabel = isTv ? "Series" : "Movies";
  const searchQuery = activeSearch.trim();

  const resetResults = useCallback((nextSearch = activeSearch) => {
    SetMovies([]);
    setPage(1);
    setActiveSearch(nextSearch);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeSearch]);

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

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setBrowseError("");

    let requestUrl = "";

    if (searchQuery) {
      requestUrl = tmdbUrl(`/search/${isTv ? "tv" : "movie"}`, {
        page,
        query: searchQuery
      });
    } else if (category === "popular") {
      requestUrl = tmdbUrl(isTv ? "/tv/popular" : "/movie/popular", { page });
    } else if (category === "trending") {
      requestUrl = tmdbUrl(`/trending/${isTv ? "tv" : "movie"}/week`, { page });
    } else if (category === "top-rated") {
      requestUrl = tmdbUrl(isTv ? "/tv/top_rated" : "/movie/top_rated", { page });
    } else if (category === "upcoming") {
      requestUrl = tmdbUrl(isTv ? "/tv/on_the_air" : "/movie/upcoming", { page });
    } else {
      requestUrl = tmdbUrl(`/discover/${isTv ? "tv" : "movie"}`, {
        page,
        sort_by: "popularity.desc",
        with_genres: genre
      });
    }

    axios
      .get(requestUrl)
      .then((res) => {
        if (!cancelled) {
          SetMovies((previousMovies) => [...previousMovies, ...(res.data.results || [])]);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBrowseError("Could not load this category from TMDB. Check your internet connection and try again.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [page, category, genre, isTv, searchQuery]);

  useEffect(() => {
    if (!didMountSearchRef.current) {
      didMountSearchRef.current = true;
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      resetResults(searchTerm.trim());
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [resetResults, searchTerm]);

  useEffect(() => {
    function handleScroll() {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 200;

      if (nearBottom && !loading && !browseError) {
        setPage((previousPage) => previousPage + 1);
      }
    }

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [browseError, loading]);

  function openTitle(item) {
    if (isTv) {
      navigate(`/TV/${item.id}/Details`);
      return;
    }

    navigate(`/Movies/${item.id}/Details`);
  }

  function getTitle(item) {
    return item.title || item.name;
  }

  function getReleaseYear(item) {
    const date = item.release_date || item.first_air_date;
    return date ? date.slice(0, 4) : "Soon";
  }

  return (
    <div className="movies-page">
      <header className="movies-header">
        <Link to={'/'} style={{textDecoration : "none"}}>
            <div className="brand">CINESTREAM</div>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="/">Home</a>
          <a href="#movies" className="active">Movies</a>
          <a href="#shows">TV Shows</a>
          {currentUser && <a href="#favorites">My List</a>}
        </nav>
        <div className="header-actions">
          {currentUser ? (
            <>
              <button
                type="button"
                className="signout-button"
                onClick={() => {
                  logoutUser();
                  setCurrentUser(null);
                }}
              >
                Sign Out
              </button>
              <div className="profile-avatar" aria-label="Profile">
                {currentUser.name?.slice(0, 1).toUpperCase() || "U"}
              </div>
            </>
          ) : (
            <Link to="/Login" className="signin-link">Sign In</Link>
          )}
        </div>
      </header>

      <section className="browse-toolbar" aria-label="Browse filters">
        <div className="browse-search">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name..."
            aria-label="Search by name"
          />
        </div>
        <div className="browse-filters">
          <select
            value={mediaType}
            onChange={(event) => {
              setMediaType(event.target.value);
              setGenre("");
              resetResults();
            }}
            aria-label="Media type"
          >
            <option value="movie">Movies</option>
            <option value="tv">Series</option>
          </select>
          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              resetResults();
            }}
            aria-label="Category"
          >
            <option value="popular">Popular</option>
            <option value="trending">Trending</option>
            <option value="top-rated">Top Rated</option>
            <option value="upcoming">Upcoming</option>
            <option value="discover">All / By Genre</option>
          </select>
          <select
            value={genre}
            onChange={(event) => {
              setGenre(event.target.value);
              setCategory("discover");
              resetResults();
            }}
            aria-label="Genre"
          >
            {activeGenres.map((item) => (
              <option key={item.id || "all"} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {heroMovie && (
        <section
          id="movies-hero"
          className="hero-section"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(14, 14, 14, 0.96) 0%, rgba(14, 14, 14, 0.62) 42%, rgba(14, 14, 14, 0.12) 100%), linear-gradient(0deg, #111 0%, rgba(17, 17, 17, 0) 35%), url(https://image.tmdb.org/t/p/original${heroMovie.backdrop_path || heroMovie.poster_path})`
          }}
        >
          <div className="hero-content">
            <div className="hero-meta">
              <span>Streaming Now</span>
              <strong>Star {heroMovie.vote_average?.toFixed(1)} Rating</strong>
            </div>
            <h1>{getTitle(heroMovie)}</h1>
            <p>{heroMovie.overview}</p>
            <div className="hero-buttons">
              <button type="button" onClick={() => openTitle(heroMovie)}>
                Play Now
              </button>
              <button type="button" className="secondary-button">
                + My List
              </button>
            </div>
          </div>
        </section>
      )}

      <main className="movies-content">
        {currentUser && (
          <section id="favorites" className="movie-section" aria-labelledby="favorites-title">
            <div className="section-heading">
              <h2 id="favorites-title">{currentUser.name}'s Favorite List</h2>
            </div>
            {favorites.length > 0 ? (
              <div className="poster-grid">
                {favorites.map((item) => (
                  <button
                    type="button"
                    className="poster-card"
                    key={`${item.mediaType}-${item.id}`}
                    onClick={() =>
                      item.mediaType === "tv"
                        ? navigate(`/TV/${item.id}/Details`)
                        : navigate(`/Movies/${item.id}/Details`)
                    }
                    onMouseMove={handleCardMouseMove}
                    onMouseLeave={handleCardMouseLeave}
                  >
                    <div className="parallax-card-frame">
                      <img
                        src={item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : ""}
                        alt={item.title || item.name}
                      />
                    </div>
                    <strong>{item.title || item.name}</strong>
                    <small>Saved to favorites</small>
                  </button>
                ))}
              </div>
            ) : (
              <p className="loading-text">Your favorite list is empty.</p>
            )}
          </section>
        )}

        {/* <section className="continue-section" aria-labelledby="continue-title">
          <h2 id="continue-title">Continue Watching</h2>
          <div className="continue-row">
            {trendingMovies.slice(0, 2).map((movie) => (
              <button
                type="button"
                className="wide-movie-card"
                key={movie.id}
                onClick={() => navigate(`/Movies/${movie.id}/Details`)}
              >
                <img
                  src={movie.backdrop_path ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}` : `https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                  alt={movie.title}
                />
                <span>{movie.title}</span>
                <small>Rating {movie.vote_average?.toFixed(1)}</small>
              </button>
            ))}
          </div>
        </section> */}

        <section id="movies" className="movie-section" aria-labelledby="trending-title">
          <div className="section-heading">
            <h2 id="trending-title">{searchQuery ? `Search Results for "${searchQuery}"` : `Featured ${titleLabel}`}</h2>
            <button type="button">View All</button>
          </div>
          <div className="trending-row">
            {trendingMovies.map((movie, index) => (
              <button
                type="button"
                className={index === 0 ? "movie-card featured-card" : "movie-card"}
                key={movie.id}
                onClick={() => openTitle(movie)}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <div className="parallax-card-frame">
                  <img
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w342${movie.poster_path}` : ""}
                    alt={getTitle(movie)}
                  />
                  <div className="movie-card-badges">
                    <span>{getReleaseYear(movie)}</span>
                    <span style={{ backgroundColor: getRatingColor(movie.vote_average || 0) }}>
                      {(movie.vote_average || 0).toFixed(1)}
                    </span>
                  </div>
                  {index === 0 && <span className="rank">#1</span>}
                </div>
                <strong>{getTitle(movie)}</strong>
                <small>{movie.release_date || movie.first_air_date || "Now Streaming"}</small>
              </button>
            ))}
          </div>
        </section>

        <section id="shows" className="movie-section" aria-labelledby="popular-title">
          <h2 id="popular-title">{category === "top-rated" ? "Top Rated" : category === "trending" ? "Trending" : category === "upcoming" ? "Upcoming" : "Popular"} {titleLabel}</h2>
          <div className="poster-grid">
            {popularMovies.map((movie) => (
              <button
                type="button"
                className="poster-card"
                key={movie.id}
                onClick={() => openTitle(movie)}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <div className="parallax-card-frame">
                  <img
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w342${movie.poster_path}` : ""}
                    alt={getTitle(movie)}
                  />
                  <div className="movie-card-badges">
                    <span>{getReleaseYear(movie)}</span>
                    <span style={{ backgroundColor: getRatingColor(movie.vote_average || 0) }}>
                      {(movie.vote_average || 0).toFixed(1)}
                    </span>
                  </div>
                </div>
                <strong>{getTitle(movie)}</strong>
                <small>{movie.release_date || movie.first_air_date || "Now Streaming"}</small>
              </button>
            ))}
          </div>
        </section>

        {!loading && Movies.length === 0 && (
          <p className="loading-text">
            {browseError || `No ${titleLabel.toLowerCase()} found. Try another search or category.`}
          </p>
        )}
        {browseError && Movies.length > 0 && (
          <p className="loading-text">{browseError}</p>
        )}
        {loading && <p className="loading-text">Loading movies...</p>}
      </main>
    </div>
  );
}

export default MoviesList;
