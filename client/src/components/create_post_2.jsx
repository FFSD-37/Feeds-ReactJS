import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ImageEditor = () => {
  const imgRef = useRef();
  const canvasRef = useRef();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [imageSrc, setImageSrc] = useState(null);
  const [scale, setScale] = useState(1);

  const [filters, setFilters] = useState({
    brt: 1,
    cnt: 1,
    gs: 0,
    inv: 0,
    opa: 1,
    sat: 1,
    sep: 0,
    blr: 0,
    hr: 0,
  });

  // Load image from localStorage on mount
  useEffect(() => {
    if (!state || !state.fromCreatePost) {
      window.location.href = '/create_post';
      return;
    }

    const keys = Object.keys(localStorage).filter(k =>
      k.startsWith('uploadedFile_'),
    );
    if (!keys.length) return;

    const { data } = JSON.parse(localStorage.getItem(keys[0]));
    setImageSrc(data);
  }, []);

  // Apply filters live
  const filterStyle = `
    brightness(${filters.brt})
    contrast(${filters.cnt})
    grayscale(${filters.gs})
    invert(${filters.inv})
    opacity(${filters.opa})
    saturate(${filters.sat})
    sepia(${filters.sep})
    blur(${filters.blr}px)
    hue-rotate(${filters.hr}deg)
  `;

  // Zoom with mouse wheel
  const handleWheel = e => {
    let newScale = scale + e.deltaY * -0.001;
    newScale = Math.min(Math.max(0.5, newScale), 2);
    setScale(newScale);
  };

  // Update slider values
  const updateFilter = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      brt: 1,
      cnt: 1,
      gs: 0,
      inv: 0,
      opa: 1,
      sat: 1,
      sep: 0,
      blr: 0,
      hr: 0,
    });
  };

  // Export edited image and submit
  const exportImage = () => {
    if (!imageSrc) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.src = imageSrc;
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      ctx.filter = filterStyle;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        blob => {
          const reader = new FileReader();
          reader.onload = () => {
            localStorage.setItem(
              'uploadedFile_0',
              JSON.stringify({
                name: 'edited-image.jpg',
                data: reader.result,
              }),
            );
          };
          reader.readAsDataURL(blob);
          navigate('/finalize_post', { state: { fromCreatePost: true } });
        },
        'image/jpeg',
        0.95,
      );
    };
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        background: 'linear-gradient(#161a1d, #2b2d42)',
      }}
    >
      {/* LEFT IMAGE PANEL */}
      <div
        className="left"
        onWheel={handleWheel}
        style={{
          flex: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {imageSrc && (
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Preview"
            style={{
              maxWidth: '80%',
              maxHeight: '80%',
              transform: `scale(${scale})`,
              filter: filterStyle,
            }}
          />
        )}
      </div>

      {/* RIGHT FILTER PANEL */}
      <div
        className="right"
        style={{
          flex: 1,
          padding: '15px',
          background: 'linear-gradient(135deg, #668acd, #84a7e3)',
          color: '#fff',
          overflowY: 'auto',
        }}
      >
        <h3>Filters</h3>

        {Object.entries(filters).map(([key, val]) => (
          <div key={key}>
            <label>
              {key.toUpperCase()} :{' '}
              {key === 'blr'
                ? `${val}px`
                : key === 'hr'
                  ? `${val}°`
                  : `${Math.round(val * 100)}%`}
            </label>

            <input
              type="range"
              min={key === 'hr' ? 0 : 0}
              max={
                key === 'hr'
                  ? 360
                  : key === 'blr'
                    ? 20
                    : key === 'gs' ||
                        key === 'sep' ||
                        key === 'inv' ||
                        key === 'opa'
                      ? 1
                      : 4
              }
              step={key === 'blr' || key === 'hr' ? 1 : 0.05}
              value={val}
              onChange={e => updateFilter(key, e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        ))}

        <button onClick={resetFilters}>Reset Filters</button>

        <br />

        <button type="button" onClick={exportImage}>
          Proceed
        </button>
      </div>

      {/* Hidden canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ImageEditor;
