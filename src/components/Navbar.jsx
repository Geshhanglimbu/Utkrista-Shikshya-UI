
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
        <div className="nav-left">
            <div className="logo">
            /#/ <span>उत्कृष्ट शिक्षा</span>
            </div>
            <input
            type = "text"
            placeholder="Search for courses"
            className="search-input"
            />
        </div>
        <div className="nav-right">
            <a href = "#">Courses</a>
            <a href = "#">About Us</a>
            <a href = "#">Articles</a>
            <a href = "#">Contact</a>
            <button className="login-btn">Login</button>
            <button className="signup-btn">Sign Up</button>
        </div>
    </nav>
  );
}
export default Navbar;