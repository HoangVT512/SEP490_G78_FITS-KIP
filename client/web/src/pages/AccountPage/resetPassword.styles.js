// Reset Password specific styles and animations
export const resetPasswordStyles = {
  // Enhanced styles for OTP input states
  otpInputVerified: {
    border: "2px solid #52c41a",
    boxShadow: "0 0 0 2px rgba(82, 196, 26, 0.2)",
    transition: "all 0.3s ease",
  },

  otpInputLoading: {
    border: "2px solid #1890ff",
    boxShadow: "0 0 0 2px rgba(24, 144, 255, 0.2)",
    transition: "all 0.3s ease",
  },

  otpInputDefault: {
    transition: "all 0.3s ease",
  },

  // Animation containers with enhanced transitions
  otpContainer: {
    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
    overflow: "hidden",
  },

  otpContainerHidden: {
    opacity: 0,
    transform: "translateY(-20px)",
    maxHeight: "0px",
    marginBottom: "0px",
    pointerEvents: "none",
  },

  otpContainerVisible: {
    opacity: 1,
    transform: "translateY(0px)",
    maxHeight: "200px",
    marginBottom: "20px",
    pointerEvents: "auto",
  },

  passwordFieldsContainer: {
    overflow: "hidden",
    transition: "all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)",
  },

  passwordFieldsHidden: {
    maxHeight: "0px",
    opacity: 0,
    transform: "translateY(50px)",
    marginTop: "0px",
    pointerEvents: "none",
  },

  passwordFieldsVisible: {
    maxHeight: "500px",
    opacity: 1,
    transform: "translateY(0px)",
    marginTop: "30px",
    pointerEvents: "auto",
  },

  // Enhanced form item styles with staggered animation delays
  passwordFieldItem: (index = 0) => ({
    transition: `all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)`,
    transitionDelay: `${0.2 + (index * 0.15)}s`,
    transform: "translateY(0px)",
  }),

  // Individual field animation states
  passwordFieldHidden: (index = 0) => ({
    opacity: 0,
    transform: "translateY(40px) scale(0.95)",
    transition: `all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)`,
    transitionDelay: `${index * 0.1}s`,
  }),

  passwordFieldVisible: (index = 0) => ({
    opacity: 1,
    transform: "translateY(0px) scale(1)",
    transition: `all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)`,
    transitionDelay: `${0.3 + (index * 0.15)}s`,
  }),

  // Success state styles
  verificationSuccess: {
    background: "linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)",
    border: "1px solid #b7eb8f",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "20px",
    transition: "all 0.3s ease",
  },

  // Header transition styles
  headerTransition: {
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  },

  // Submit button animation with enhanced delay
  submitButtonVisible: {
    opacity: 1,
    transform: "translateY(0px)",
    transition: "all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)",
    transitionDelay: "0.6s",
  },

  submitButtonHidden: {
    opacity: 0,
    transform: "translateY(30px)",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  },

  // Enhanced alert styles
  alertWithAnimation: {
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    marginBottom: "20px",
  },

  alertFadeOut: {
    opacity: 0,
    transform: "translateY(-10px)",
    maxHeight: "0px",
    marginBottom: "0px",
    overflow: "hidden",
  },

  // Navigation buttons with enhanced styling
  navigationButtons: {
    textAlign: "center",
    transition: "all 0.3s ease",
  },

  // Staggered animation utilities
  animationDelay: (delay) => ({
    animationDelay: `${delay}s`,
  }),

  // Hover effects for interactive elements
  interactiveHover: {
    transition: "all 0.2s ease",
    ":hover": {
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    },
  },

  // Form validation state styles
  validationSuccess: {
    borderColor: "#52c41a",
    boxShadow: "0 0 0 2px rgba(82, 196, 26, 0.2)",
  },

  validationError: {
    borderColor: "#ff4d4f",
    boxShadow: "0 0 0 2px rgba(255, 77, 79, 0.2)",
  },

  // Progress indicator styles
  progressIndicator: {
    height: "3px",
    background: "linear-gradient(90deg, #52c41a 0%, #73d13d 100%)",
    borderRadius: "2px",
    transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
    marginBottom: "24px",
  },

  // Enhanced loading states
  loadingOverlay: {
    position: "relative",
    ":after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(1px)",
      borderRadius: "8px",
      opacity: 0,
      pointerEvents: "none",
      transition: "opacity 0.3s ease",
    },
  },

  loadingOverlayActive: {
    ":after": {
      opacity: 1,
      pointerEvents: "auto",
    },
  },
};