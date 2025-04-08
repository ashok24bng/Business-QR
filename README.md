<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>QR Card - Generate QR Codes & Earn</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
    <!-- SweetAlert2 for notifications -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  </head>
  <body>
    <!-- Animated Background -->
    <div class="animated-bg"></div>

   <!-- Minimal Navigation -->
    <div class="minimal-nav">
        <div class="nav-buttons">
            <a href="#pricing" class="nav-link glass-button">
                <i class="fas fa-crown"></i>
                Plans
            </a>
            <button class="nav-link glass-button" id="loginBtn">
                <i class="fas fa-sign-in-alt"></i>
                Login
            </button>
        </div>
    </div>


    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <div class="hero-text">
            <div class="logo-hero">
              <i class="fas fa-qrcode"></i>
              <span>QR Card</span>
            </div>
            <h1 class="gradient-text">Generate QR Codes & Earn Money</h1>
            <p class="hero-subtitle">Create QR codes and earn upto ₹30000 Per month. Start your journey to financial freedom today!</p>
            <div class="hero-features">
              <div class="feature-card">
                <i class="fas fa-bolt"></i>
                <h3>Fast Generation</h3>
                <p>Create QR codes in seconds</p>
              </div>
              <div class="feature-card">
                <i class="fas fa-money-bill-wave"></i>
                <h3>Instant Earnings</h3>
                <p>Get paid for every QR Code</p>
              </div>
              <div class="feature-card">
                <i class="fas fa-chart-line"></i>
                <h3>Track Progress</h3>
                <p>Monitor your earnings</p>
              </div>
            </div>
            <div class="hero-buttons">
              <a href="login.html" class="cta-button">
                <i class="fas fa-rocket"></i>
                Start Earning Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section class="pricing-section glass-card" id="pricing">
        <div class="container">
            <h2 class="section-title">Choose Your Plan</h2>
            <div class="pricing-grid">
                <!-- Free Trial Plan -->
                <div class="pricing-card glass-card">
                    <div class="plan-icon">
                        <i class="fas fa-paper-plane"></i>
                    </div>
                    <h3>Free Trial</h3>
                    <div class="price">
                        <span class="currency">₹</span>
                        <span class="amount">0</span>
                        <span class="duration">/7 days</span>
                    </div>
                    <ul class="features">
                        <li><i class="fas fa-check"></i> 50 QR Codes Daily</li>
                        <li><i class="fas fa-check"></i> ₹5 per 50 Codes</li>
                    </ul>
                    <a href="login.html" class="btn-primary">Start Free Trial</a>
                </div>

                <!-- Basic Plan -->
                <div class="pricing-card glass-card">
                    <div class="plan-icon">
                        <i class="fas fa-rocket"></i>
                    </div>
                    <h3>Basic Plan</h3>
                    <div class="price">
                        <span class="currency">₹</span>
                        <span class="amount">1999</span>
                        <span class="duration">/unlimited</span>
                    </div>
                    <ul class="features">
                        <li><i class="fas fa-check"></i> 1000 QR Codes Daily</li>
                        <li><i class="fas fa-check"></i> ₹10 per 50 Codes</li>
                    </ul>
                    <a href="login.html" class="btn-primary">Choose Basic</a>
                </div>

                <!-- Premium Plan -->
                <div class="pricing-card glass-card featured">
                    <div class="popular-tag">Popular</div>
                    <div class="plan-icon">
                        <i class="fas fa-star"></i>
                    </div>
                    <h3>Premium Plan</h3>
                    <div class="price">
                        <span class="currency">₹</span>
                        <span class="amount">4999</span>
                        <span class="duration">/unlimited</span>
                    </div>
                    <ul class="features">
                        <li><i class="fas fa-check"></i> 1500 QR Codes Daily</li>
                        <li><i class="fas fa-check"></i> ₹15 per 50 Codes</li>
                    </ul>
                    <a href="login.html" class="btn-primary">Choose Premium</a>
                </div>

                <!-- Pro Plan -->
                <div class="pricing-card glass-card">
                    <div class="plan-icon">
                        <i class="fas fa-crown"></i>
                    </div>
                    <h3>Pro Plan</h3>
                    <div class="price">
                        <span class="currency">₹</span>
                        <span class="amount">9999</span>
                        <span class="duration">/unlimited</span>
                    </div>
                    <ul class="features">
                        <li><i class="fas fa-check"></i> 3000 QR Codes Daily</li>
                        <li><i class="fas fa-check"></i> ₹20 per 50 Codes</li>
                    </ul>
                    <a href="login.html" class="btn-primary">Choose Pro</a>
                </div>
            </div>
        </div>
    </section>

    <!-- About Us Section -->
    <section id="about" class="about">
        <div class="container">
            <h2 class="gradient-text">About Us</h2>
            <div class="about-grid">
                <div class="glass-card">
                    <i class="fas fa-rocket fa-2x" style="color: var(--primary-purple)"></i>
                    <h3>Our Mission</h3>
                    <p>We're dedicated to revolutionizing QR code management, making it accessible and efficient for businesses of all sizes.</p>
                </div>
                <div class="glass-card">
                    <i class="fas fa-chart-line fa-2x" style="color: var(--accent-pink)"></i>
                    <h3>Our Growth</h3>
                    <p>Since our inception, we've helped thousands of businesses generate millions of QR codes, driving digital transformation.</p>
                </div>
                <div class="glass-card">
                    <i class="fas fa-users fa-2x" style="color: var(--secondary-purple)"></i>
                    <h3>Our Community</h3>
                    <p>Join our growing community of entrepreneurs and businesses who trust us for their QR code needs.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Demo Video Section -->
    <section id="demo" class="demo-video">
        <div class="container">
            <h2 class="gradient-text">See How It Works</h2>
            <div class="video-container">
                <iframe src="https://www.youtube.com/embed/your-video-id" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
        </div>
    </section>

    <!-- Work Trial Section -->
    <section id="trial" class="work-trial">
        <div class="container">
            <h2 class="gradient-text">Start Your Journey</h2>
            <p>Experience the power of our QR management system with a free trial</p>
            <div class="trial-buttons">
                <a href="login.html" class="btn-primary btn">
                    <i class="fas fa-play"></i>
                    Start Free Trial
                </a>
            </div>
        </div>
    </section>

    <!-- FAQ Section -->
    <section id="faq" class="faq">
        <div class="container">
            <h2 class="gradient-text">Frequently Asked Questions</h2>
            <div class="faq-grid">
                <div class="glass-card faq-item">
                    <h3>What is QR Card?</h3>
                    <p>QR Card is a comprehensive QR code management system that helps businesses create, track, and manage QR codes efficiently.</p>
                </div>
                <div class="glass-card faq-item">
                    <h3>How does the pricing work?</h3>
                    <p>We offer flexible plans starting from free tier to premium, designed to meet different business needs and scales.</p>
                </div>
                <div class="glass-card faq-item">
                    <h3>Can I try before subscribing?</h3>
                    <p>Yes! We offer a free trial period where you can explore all premium features without any commitment.</p>
                </div>
                <div class="glass-card faq-item">
                    <h3>How is earnings paid?</h3>
                    <p>Get paid for every Qr code. Once you withdraw your earnings, You will get paid within 24hrs to your bank account.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- WhatsApp Support -->
    <a href="https://wa.me/+919876543210" class="whatsapp-support" target="_blank">
        <i class="fab fa-whatsapp"></i>
        <span>Need Help?</span>
    </a>
    <script>
        document.getElementById("loginBtn").addEventListener("click", function () {
          window.location.href = "login.html";
        });
      </script>    
  </body>
</html>
