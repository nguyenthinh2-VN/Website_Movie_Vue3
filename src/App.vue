<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #ffffff;
  min-height: 100vh;
  padding-top: 80px; /* Space for fixed navbar */
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.featured-container {
  padding-top: 3rem;
}

/* Featured Section */
.featured-section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.5rem;
  color: #ff6b6b;
  margin-bottom: 2rem;
  text-align: center;
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 3px;
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  border-radius: 2px;
}

/* Loading and Error States */
.loading-section,
.error-section {
  text-align: center;
  padding: 3rem 0;
  color: #ffffff;
}

.loading-section .spinner-border {
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
}

.loading-text {
  font-size: 1.1rem;
  color: #a0a0a0;
}

.error-section .alert {
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #ffffff;
  max-width: 600px;
  margin: 0 auto;
}

.debug-info {
  max-width: 800px;
  margin: 0 auto;
  text-align: left;
}

.debug-info pre {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  color: #ffffff;
  font-size: 0.85rem;
  overflow-x: auto;
  white-space: pre-wrap;
}

/* Movies Grid */
.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

/* No Data Section */
.no-data-section {
  text-align: center;
  padding: 4rem 2rem;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-data-content {
  max-width: 500px;
  margin: 0 auto;
}

.no-data-content i {
  color: rgba(255, 255, 255, 0.3) !important;
}

.btn-retry {
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  border: none;
  color: #ffffff;
  padding: 0.75rem 2rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: bold;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-retry:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 107, 107, 0.4);
}


/* Responsive Design */
@media (max-width: 768px) {
  .movies-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .no-data-section {
    padding: 3rem 1rem;
    min-height: 300px;
  }
  
  .btn-retry {
    padding: 0.6rem 1.5rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 576px) {
  .container {
    padding: 0 1rem;
  }
  
  .movies-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .section-title {
    font-size: 1.8rem;
  }
  
  .featured-container {
    padding-top: 2rem;
  }
}

@media (max-width: 400px) {
  .movies-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .container {
    padding: 0 0.5rem;
  }
}
</style>
 