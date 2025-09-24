<template>
  <Transition name="fade">
    <button
      v-show="isVisible"
      @click="scrollToTop"
      class="back-to-top-btn"
      type="button"
      aria-label="Back to top"
    >
      <i class="bi bi-chevron-up"></i>
    </button>
  </Transition>
</template>

<script>
export default {
  name: "BackToTop",
  data() {
    return {
      isVisible: false,
      scrollThreshold: 300, // Show button after scrolling 300px
    };
  },
  mounted() {
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    handleScroll() {
      this.isVisible = window.scrollY > this.scrollThreshold;
    },

    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
  },
};
</script>

<style scoped>
.back-to-top-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  
  /* Transparent background with blur effect */
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  
  /* Center the icon */
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-to-top-btn:hover {
  transform: translateY(-3px) scale(1.05);
  background: rgba(255, 107, 107, 0.2);
  border-color: rgba(255, 107, 107, 0.4);
  box-shadow: 
    0 12px 40px rgba(255, 107, 107, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.back-to-top-btn:active {
  transform: translateY(-1px) scale(0.98);
  background: rgba(255, 107, 107, 0.3);
}

.back-to-top-btn:focus {
  outline: none;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 3px rgba(255, 107, 107, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.back-to-top-btn i {
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Transition animations */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.7);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0.7);
}

/* Responsive design */
@media (max-width: 768px) {
  .back-to-top-btn {
    bottom: 1.5rem;
    right: 1.5rem;
    width: 3rem;
    height: 3rem;
  }

  .back-to-top-btn i {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .back-to-top-btn {
    bottom: 1rem;
    right: 1rem;
    width: 2.5rem;
    height: 2.5rem;
  }

  .back-to-top-btn i {
    font-size: 0.9rem;
  }
}

/* Glass morphism enhancement */
.back-to-top-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 50%, 
    rgba(255, 255, 255, 0.02) 100%
  );
  pointer-events: none;
}
</style>