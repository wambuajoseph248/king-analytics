import { useEffect, useState } from "react";
import "./App.css";

const icons = {
  "Data Analysis": "📊",
  "Project Writing": "📝",
  "Research Services": "🔎",
  "Database Management": "💾",
  "Business Analysis": "💼",
  "Consultation": "📅",
  "Data Visualization": "📈",
  "Statistical Consulting": "📐",
  "Business Intelligence": "💡",
};

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState("");

  const [booking, setBooking] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });

  const [bookingStatus, setBookingStatus] = useState({
    type: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await fetch("https://king-analytics-api.onrender.com/api/services");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error("Unable to load services.");
        }

        const formattedServices = data.services.map((service) => ({
          id: service.id,
          title: service.name,
          text:
            service.description ||
            "Professional service provided by King Analytics.",
          price: service.price,
          icon: icons[service.name] || "📊",
        }));

        setServices(formattedServices);
      } catch (error) {
        console.error("SERVICES ERROR:", error);
        setServicesError("Unable to load services. Please try again later.");
      } finally {
        setServicesLoading(false);
      }
    };

    loadServices();
  }, []);

  const handleBookingChange = (e) => {
    const { name, value } = e.target;

    setBooking((previousBooking) => ({
      ...previousBooking,
      [name]: value,
    }));
  };

  const submitBooking = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    setBookingStatus({
      type: "loading",
      message: "Submitting your project request...",
    });

    try {
      const response = await fetch("https://king-analytics-api.onrender.com/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: booking.name.trim(),
          email: booking.email.trim(),
          phone: booking.phone.trim(),
          service: booking.service,
          message: booking.message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to submit your booking.");
      }

      setBookingStatus({
        type: "success",
        message: `Booking #${data.booking.id} submitted successfully. King Analytics will contact you shortly.`,
      });

      setBooking({
        name: "",
        email: "",
        phone: "",
        service: "",
        message: "",
      });
    } catch (error) {
      console.error("BOOKING ERROR:", error);

      setBookingStatus({
        type: "error",
        message:
          error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });

    setMenuOpen(false);
  };

  return (
    <div className="app">
      {/* NAVIGATION */}
      <header className="navbar">
        <div className="container nav-content">
          <div className="logo" onClick={() => scrollTo("home")}>
            <span>K</span> KING ANALYTICS
          </div>

          <button
            className="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>

          <nav className={menuOpen ? "nav-links open" : "nav-links"}>
            <button onClick={() => scrollTo("home")}>Home</button>
            <button onClick={() => scrollTo("services")}>Services</button>
            <button onClick={() => scrollTo("about")}>About</button>
            <button onClick={() => scrollTo("booking")}>
              Book a Service
            </button>
            <button onClick={() => scrollTo("contact")}>Contact</button>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section id="home" className="hero">
        <div className="container hero-grid">
          <div className="hero-text">
            <div className="badge">
              DATA • RESEARCH • BUSINESS INTELLIGENCE
            </div>

            <h1>
              Transforming <span>Data</span> Into Smart Decisions.
            </h1>

            <p>
              King Analytics provides professional data analysis, research,
              project writing, database management and business analysis
              services for individuals, businesses and organizations.
            </p>

            <div className="hero-buttons">
              <button
                className="primary-button"
                onClick={() => scrollTo("booking")}
              >
                Book a Service →
              </button>

              <button
                className="secondary-button"
                onClick={() => scrollTo("services")}
              >
                Explore Services
              </button>
            </div>

            <div className="trust-row">
              <div>
                <strong>Professional</strong>
                <small>Quality-focused service</small>
              </div>

              <div>
                <strong>Data Driven</strong>
                <small>Insights that matter</small>
              </div>

              <div>
                <strong>Client Focused</strong>
                <small>Solutions tailored to you</small>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="dashboard-card">
              <div className="dashboard-header">
                <span>Analytics Overview</span>
                <span>● Live</span>
              </div>

              <div className="chart">
                <div style={{ height: "43%" }}></div>
                <div style={{ height: "70%" }}></div>
                <div style={{ height: "62%" }}></div>
                <div style={{ height: "85%" }}></div>
                <div style={{ height: "95%" }}></div>
              </div>

              <div className="dashboard-stats">
                <div>
                  <span>Projects</span>
                  <strong>250+</strong>
                </div>

                <div>
                  <span>Accuracy</span>
                  <strong>98%</strong>
                </div>

                <div>
                  <span>Support</span>
                  <strong>24/7</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="section">
        <div className="container">
          <div className="section-heading">
            <span>WHAT WE DO</span>
            <h2>Professional Digital Solutions</h2>
            <p>
              From raw data to actionable insights, King Analytics provides
              solutions designed around your needs.
            </p>
          </div>

          {servicesLoading && (
            <p className="booking-status loading">Loading services...</p>
          )}

          {servicesError && (
            <p className="booking-status error">{servicesError}</p>
          )}

          <div className="services-grid">
            {services.map((service) => (
              <article className="service-card" key={service.id}>
                <div className="service-icon">{service.icon}</div>

                <h3>{service.title}</h3>

                <p>{service.text}</p>

                <button
                  onClick={() => {
                    setBooking((previousBooking) => ({
                      ...previousBooking,
                      service: service.title,
                    }));

                    scrollTo("booking");
                  }}
                  className="learn-button"
                >
                  Request Service →
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="section about-section">
        <div className="container about-grid">
          <div className="about-visual">
            <div className="about-main-card">
              <span>KING</span>
              <strong>ANALYTICS</strong>
              <p>Data • Research • Strategy</p>
            </div>

            <div className="floating-card">📈 Smart Decisions</div>
          </div>

          <div className="about-text">
            <span className="section-label">ABOUT KING ANALYTICS</span>

            <h2>Your Digital Partner for Data & Business Solutions.</h2>

            <p>
              King Analytics is a modern digital consultancy focused on
              helping clients understand their data, complete research
              projects and make better business decisions.
            </p>

            <p>
              Whether you are a student, researcher, entrepreneur, startup
              or established organization, we provide practical and
              professional solutions tailored to your objectives.
            </p>

            <div className="check-list">
              <div>✓ Professional analytical support</div>
              <div>✓ Confidential client projects</div>
              <div>✓ Clear and understandable reporting</div>
              <div>✓ Flexible service engagement</div>
            </div>
          </div>
        </div>
      </section>

      {/* BOOKING */}
      <section id="booking" className="section booking-section">
        <div className="container">
          <div className="section-heading">
            <span>START A PROJECT</span>
            <h2>Book a Service</h2>
            <p>Tell us what you need and we'll get back to you.</p>
          </div>

          <div className="booking-card">
            <form onSubmit={submitBooking}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your full name"
                    value={booking.name}
                    onChange={handleBookingChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={booking.email}
                    onChange={handleBookingChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Your phone number"
                  value={booking.phone}
                  onChange={handleBookingChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="service">Service Required</label>

                <select
                  id="service"
                  name="service"
                  value={booking.service}
                  onChange={handleBookingChange}
                  required
                >
                  <option value="">Select a service</option>

                  {services.map((service) => (
                    <option key={service.id} value={service.title}>
                      {service.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Project Description</label>

                <textarea
                  id="message"
                  name="message"
                  rows="6"
                  placeholder="Describe what you need help with..."
                  value={booking.message}
                  onChange={handleBookingChange}
                  required
                ></textarea>
              </div>

              <button
                className="primary-button full-button"
                type="submit"
                disabled={submitting}
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Project Request →"}
              </button>
            </form>

            {bookingStatus.message && (
              <div className={`booking-status ${bookingStatus.type}`}>
                {bookingStatus.message}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* PAYMENT */}
      <section className="payment-section">
        <div className="container">
          <div className="payment-content">
            <div>
              <span className="section-label">SECURE PAYMENTS</span>

              <h2>Pay Conveniently From Kenya or Anywhere in the World.</h2>

              <p>
                We will integrate secure M-Pesa and PayPal checkout into your
                booking workflow so clients can pay after receiving their
                quotation.
              </p>
            </div>

            <div className="payment-methods">
              <div className="payment-card">
                <span>📱</span>
                <h3>M-Pesa</h3>
                <p>0740 372 481</p>
              </div>

              <div className="payment-card">
                <span>💳</span>
                <h3>PayPal</h3>
                <p>wambuajoseph248@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="section contact-section">
        <div className="container contact-content">
          <span className="section-label">CONTACT KING ANALYTICS</span>

          <h2>Let's Build Something Intelligent.</h2>

          <p>
            Have a dataset, research project or business challenge? Let's
            discuss it.
          </p>

          <div className="contact-buttons">
            <a
              href="https://wa.me/254740372481"
              target="_blank"
              rel="noreferrer"
              className="primary-button"
            >
              WhatsApp Us
            </a>

            <a
              href="mailto:wambuajoseph248@gmail.com"
              className="secondary-button"
            >
              Send Email
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container footer-content">
          <div>
            <div className="logo">
              <span>K</span> KING ANALYTICS
            </div>

            <p>Data. Research. Strategy.</p>
          </div>

          <div className="footer-right">
            © 2026 King Analytics. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;