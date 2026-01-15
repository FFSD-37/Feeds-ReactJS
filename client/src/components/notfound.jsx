const NotFoundRoute = () => {
  const styles = `
    .not-found-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #eef2ff 0%, #ffffff 50%, #f0f9ff 100%);
      padding: 1.5rem;
    }

    .not-found-card {
      position: relative;
      max-width: 42rem;
      width: 100%;
      text-align: center;
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(2rem);
      border-radius: 1.5rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
      padding: 3rem;
    }

    .bg-blur {
      position: absolute;
      top: -5rem;
      left: 50%;
      transform: translateX(-50%);
      width: 18rem;
      height: 18rem;
      background: rgba(59, 130, 246, 0.2);
      border-radius: 50%;
      filter: blur(2rem);
    }

    .error-code {
      position: relative;
      font-size: 10rem;
      font-weight: 800;
      background: linear-gradient(90deg, #2563eb 0%, #4f46e5 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      line-height: 1;
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    .error-title {
      margin-top: 1rem;
      font-size: 1.875rem;
      font-weight: 600;
      color: #1f2937;
    }

    .error-message {
      margin-top: 1.5rem;
      font-size: 1.125rem;
      color: #6b7280;
      max-width: 32rem;
      margin-left: auto;
      margin-right: auto;
    }

    .home-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-top: 2.5rem;
      padding: 1rem 2.5rem;
      font-size: 1.125rem;
      font-weight: 500;
      color: white;
      background: linear-gradient(90deg, #2563eb 0%, #4f46e5 100%);
      border-radius: 0.75rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      text-decoration: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .home-button:hover {
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      transform: scale(1.03);
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.8;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="not-found-container">
        <div className="not-found-card">
          <div className="bg-blur" />
          
          <h1 className="error-code">404</h1>
          
          <p className="error-title">Page not found</p>
          
          <p className="error-message">
            The page you're looking for doesn't exist or may have been moved.
            Let's get you back somewhere familiar.
          </p>
          
          <a href="/" className="home-button">
            Go back home
          </a>
        </div>
      </div>
    </>
  );
};

export default NotFoundRoute;
