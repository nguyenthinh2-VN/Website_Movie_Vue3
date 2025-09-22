<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <!-- Logo và mô tả -->
        <div class="footer-section">
          <div class="footer-logo">
            <h3>AnimeStream</h3>
            <p>Nơi tập hợp những bộ anime hay nhất, cập nhật liên tục với chất lượng HD cao. Trải nghiệm xem phim anime tuyệt vời nhất dành cho bạn.</p>
          </div>
          <div class="social-links">
            <a href="#" class="social-link">📘</a>
            <a href="#" class="social-link">📷</a>
            <a href="#" class="social-link">🐦</a>
            <a href="#" class="social-link">📺</a>
          </div>
        </div>
        
        <!-- Liên kết nhanh -->
        <div class="footer-section">
          <h4>Liên kết nhanh</h4>
          <ul class="footer-links">
            <li><a href="#">Trang chủ</a></li>
            <li><a href="#">Anime mới nhất</a></li>
            <li><a href="#">Anime hot</a></li>
            <li><a href="#">Thể loại</a></li>
            <li><a href="#">Top anime</a></li>
          </ul>
        </div>
        
        <!-- Thể loại -->
        <div class="footer-section">
          <h4>Thể loại phổ biến</h4>
          <ul class="footer-links">
            <li><a href="#">Action</a></li>
            <li><a href="#">Romance</a></li>
            <li><a href="#">Comedy</a></li>
            <li><a href="#">Drama</a></li>
            <li><a href="#">Fantasy</a></li>
          </ul>
        </div>
        
        <!-- Thông tin liên hệ -->
        <div class="footer-section">
          <h4>Liên hệ</h4>
          <div class="contact-info">
            <p>📧 contact@animestream.com</p>
            <p>📞 +84 123 456 789</p>
            <p>📍 Hà Nội, Việt Nam</p>
          </div>
          <div class="newsletter">
            <p>Đăng ký nhận thông báo anime mới:</p>
            <div class="newsletter-form">
              <input type="email" placeholder="Email của bạn" class="newsletter-input">
              <button class="newsletter-btn">Đăng ký</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Copyright -->
      <div class="footer-bottom">
        <div class="copyright">
          <p>&copy; 2024 AnimeStream. Tất cả quyền được bảo lưu.</p>
          <div class="footer-bottom-links">
            <a href="#">Điều khoản sử dụng</a>
            <a href="#">Chính sách bảo mật</a>
            <a href="#">DMCA</a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter'
}
</script>

<style scoped>
.footer {
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  color: #ffffff;
  padding: 3rem 0 1rem;
  margin-top: auto;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 3rem;
  margin-bottom: 2rem;
}

.footer-section h3,
.footer-section h4 {
  color: #ff6b6b;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.footer-section h3 {
  font-size: 1.5rem;
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.footer-logo p {
  color: #a0a0a0;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

/* Social Links */
.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 107, 107, 0.2);
  border-radius: 50%;
  text-decoration: none;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 107, 107, 0.3);
}

.social-link:hover {
  background: #ff6b6b;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
}

/* Footer Links */
.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 0.8rem;
}

.footer-links a {
  color: #a0a0a0;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
}

.footer-links a:hover {
  color: #ff6b6b;
  padding-left: 5px;
}

.footer-links a::before {
  content: '▶';
  position: absolute;
  left: -15px;
  opacity: 0;
  transition: all 0.3s ease;
  color: #ff6b6b;
  font-size: 0.8rem;
}

.footer-links a:hover::before {
  opacity: 1;
  left: -20px;
}

/* Contact Info */
.contact-info p {
  color: #a0a0a0;
  margin-bottom: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Newsletter */
.newsletter {
  margin-top: 1.5rem;
}

.newsletter p {
  color: #a0a0a0;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.newsletter-form {
  display: flex;
  gap: 0.5rem;
}

.newsletter-input {
  flex: 1;
  padding: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  font-size: 0.9rem;
}

.newsletter-input::placeholder {
  color: #a0a0a0;
}

.newsletter-btn {
  padding: 0.8rem 1.5rem;
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  border: none;
  border-radius: 5px;
  color: #ffffff;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.newsletter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
}

/* Footer Bottom */
.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1.5rem;
}

.copyright {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.copyright p {
  color: #a0a0a0;
  margin: 0;
  font-size: 0.9rem;
}

.footer-bottom-links {
  display: flex;
  gap: 2rem;
}

.footer-bottom-links a {
  color: #a0a0a0;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.footer-bottom-links a:hover {
  color: #ff6b6b;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .footer-content {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .copyright {
    flex-direction: column;
    text-align: center;
  }
  
  .footer-bottom-links {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 1rem;
  }
  
  .footer {
    padding: 2rem 0 1rem;
  }
  
  .newsletter-form {
    flex-direction: column;
  }
  
  .social-links {
    justify-content: center;
  }
  
  .footer-bottom-links {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
