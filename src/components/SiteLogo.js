import "./SiteLogo.css";

function SiteLogo({ className = "" }) {
  return (
    <img
      className={`site-logo ${className}`.trim()}
      src="/cinestream-logo.svg"
      alt="CineStream"
    />
  );
}

export default SiteLogo;
