import "./Layout.css";

function Layout({ children }) {
  return (
    <div className="layout-container">
      <nav className="simple-side-nav">
        <h1>Drawzy</h1>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;
