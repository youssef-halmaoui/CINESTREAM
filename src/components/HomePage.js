import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SiteLogo from "./SiteLogo";
import "./HomePage.css";

const API_KEY = "e8caad2d9f38c772cf6b62242ef35237";

function HomePage() {
  const [trending, setTrending] = useState([]);
  const navigate = useNavigate();
  const heroMovie = trending[0];

  useEffect(() => {
    axios
      .get(`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`)
      .then((res) => {
        setTrending(res.data.results || []);
      })
      .catch(() => {
        setTrending([]);
      });
  }, []);

  return (
    <div className="home-page">
      <header className="home-header">
        <Link to="/" className="home-brand">
          <SiteLogo />
        </Link>
        <nav className="home-nav" aria-label="Main navigation">
          <Link to="/Movies">Movies</Link>
          <Link to="/Movies">My List</Link>
        </nav>
        <div className="home-actions">
          <button type="button" className="signin-button">Sign In</button>
          <button type="button" className="join-button" onClick={() => navigate("/Movies")}>
            Join Now
          </button>
        </div>
      </header>

      <section
        className="home-hero"
        style={{
          backgroundImage: heroMovie?.backdrop_path
            ? `linear-gradient(180deg, rgba(17, 17, 17, 0.12) 0%, #111 96%), linear-gradient(90deg, rgba(17, 17, 17, 0.82), rgba(17, 17, 17, 0.18), rgba(17, 17, 17, 0.82)), url(https://image.tmdb.org/t/p/original${heroMovie.backdrop_path})`
            : undefined
        }}
      >
        <div className="home-hero-content">
          <h1>Unlimited Movies, TV Shows, and More.</h1>
          <p>
            Watch anywhere. Cancel anytime. Start your cinematic journey today
            with the world's most immersive streaming platform.
          </p>
          <div className="home-hero-buttons">
            <button type="button" onClick={() => navigate("/Movies")}>
              Join Free for 30 Days
            </button>
            <a href="#plans">Learn More</a>
          </div>
        </div>
      </section>

      <main>
        <section className="home-section home-trending" aria-labelledby="home-trending-title">
          <h2 id="home-trending-title">Trending Now</h2>
          <div className="home-trending-row">
            {trending.slice(1, 7).map((movie) => (
              <button
                type="button"
                className="home-trending-card"
                key={movie.id}
                onClick={() => navigate(`/Movies/${movie.id}/Details`)}
              >
                <img
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`
                  }
                  alt={movie.title}
                />
              </button>
            ))}
          </div>
        </section>

        <section className="home-features" aria-label="Features">
          <article>
            <div className="feature-icon">HD</div>
            <h3>Watch in 4K UHD</h3>
            <p>Experience every detail with stunning resolution and vibrant HDR colors on all your compatible devices.</p>
          </article>
          <article>
            <div className="feature-icon">DL</div>
            <h3>Offline Viewing</h3>
            <p>Download your favorite shows and movies to watch anywhere, even without an internet connection.</p>
          </article>
          <article>
            <div className="feature-icon">CX</div>
            <h3>Cancel Anytime</h3>
            <p>No contracts, no hidden fees. Enjoy the freedom to start or stop your subscription whenever you want.</p>
          </article>
        </section>

        <section id="plans" className="home-section plans-section" aria-labelledby="plans-title">
          <div className="plans-heading">
            <h2 id="plans-title">Choose Your Plan</h2>
            <p>Select the perfect membership for your entertainment needs.</p>
          </div>
          <div className="plans-grid">
            <article className="plan-card">
              <h3>Basic</h3>
              <p><strong>$8.99</strong> /month</p>
              <ul>
                <li>720p Resolution</li>
                <li>Watch on 1 device</li>
                <li>Unlimited access</li>
              </ul>
              <button type="button" onClick={() => navigate("/Movies")}>Get Started</button>
            </article>
            <article className="plan-card featured-plan">
              <span>Most Popular</span>
              <h3>Premium</h3>
              <p><strong>$17.99</strong> /month</p>
              <ul>
                <li>4K + HDR Resolution</li>
                <li>Watch on 4 devices</li>
                <li>Dolby Atmos Audio</li>
                <li>Ad-free experience</li>
              </ul>
              <button type="button" onClick={() => navigate("/Movies")}>Get Started</button>
            </article>
            <article className="plan-card">
              <h3>Standard</h3>
              <p><strong>$13.99</strong> /month</p>
              <ul>
                <li>1080p Resolution</li>
                <li>Watch on 2 devices</li>
                <li>Unlimited access</li>
              </ul>
              <button type="button" onClick={() => navigate("/Movies")}>Get Started</button>
            </article>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div>
          <h2>CINESTREAM</h2>
          <p>The ultimate destination for world-class entertainment, delivering cinematic experiences directly to your screen.</p>
        </div>
        <div>
          <h3>Explore</h3>
          <a href="#plans">Help Center</a>
          <a href="#plans">Account</a>
          <a href="#plans">Contact Us</a>
        </div>
        <div>
          <h3>Legal</h3>
          <a href="#plans">Privacy</a>
          <a href="#plans">Terms of Use</a>
        </div>
        <div>
          <h3>Follow Us</h3>
          <div className="social-row">
            <span>IG</span>
            <span>ST</span>
            <span>YT</span>
          </div>
        </div>
        <small>© 2024 CineStream Inc. All rights reserved.</small>
      </footer>
    </div>
  );
}

export default HomePage;
