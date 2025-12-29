import React from "react";
import { useParams } from "react-router-dom";

const PosterBackdrop = () => {
  const { id } = useParams();

  const posterUrl = `https://image.tmdb.org/t/p/original/{POSTER_PATH}`; // Replace {POSTER_PATH} with actual path
  const backdropUrl = `https://image.tmdb.org/t/p/original/{BACKDROP_PATH}`; // Replace {BACKDROP_PATH} with actual path

  const handleDownload = (url, filename) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="poster-backdrop-page">
      <h1>Poster and Backdrop</h1>
      <div className="image-container">
        <div className="poster">
          <h2>Poster</h2>
          <img src={posterUrl} alt="Poster" />
          <button onClick={() => handleDownload(posterUrl, `poster-${id}.jpg`)}>
            Download Poster
          </button>
        </div>
        <div className="backdrop">
          <h2>Backdrop</h2>
          <img src={backdropUrl} alt="Backdrop" />
          <button onClick={() => handleDownload(backdropUrl, `backdrop-${id}.jpg`)}>
            Download Backdrop
          </button>
        </div>
      </div>
    </div>
  );
};

export default PosterBackdrop;