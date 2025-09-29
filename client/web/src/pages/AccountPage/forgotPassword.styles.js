// Shared styles for ForgotPassword and ResetPassword components
export const styles = {
  containerStyle: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "calc(100vh - 70px)",
    padding: "60px 20px",
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
  },

  wrapperStyle: {
    display: "flex",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 20px 40px rgba(37, 99, 235, 0.15)",
    width: "100%",
    maxWidth: "1100px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    minHeight: "650px",
  },

  logoSectionStyle: {
    flex: "1",
    background: "linear-gradient(135deg, #334766 0%, #283652 100%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
    color: "#fff",
    minWidth: "350px",
  },

  logoContentStyle: {
    textAlign: "center",
  },

  formSectionStyle: {
    flex: "1.5",
    padding: "40px 50px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    minWidth: "550px",
  },

  headerStyle: {
    textAlign: "center",
    marginBottom: "32px",
  },

  stepsStyle: {
    marginBottom: "50px",
    padding: "10px 30px",
  },

  backButtonStyle: {
    marginBottom: "24px",
  },

  buttonStyle: {
    width: "100%",
    height: "44px",
    fontSize: "15px",
    fontWeight: "600",
    background: "#334766",
    borderColor: "#334766",
    borderRadius: "8px",
  },

  // Card styles for method selection
  methodCardStyle: (isSelected) => ({
    border: isSelected ? "2px solid #334766" : "1px solid #e5e7eb",
    cursor: "pointer",
  }),

  methodCardDescriptionStyle: {
    marginLeft: "32px",
    color: "#64748b",
    fontSize: "13px",
  },

  // OTP input style
  otpInputStyle: {
    textAlign: "center",
    fontSize: "18px",
    letterSpacing: "4px",
  },

  // Steps configuration
  stepsConfig: {
    width: "100%",
    maxWidth: "600px",
    margin: "0 auto",
  },

  stepTitleStyle: {
    fontSize: "15px",
    fontWeight: 600,
    whiteSpace: "normal",
    overflow: "visible",
    textAlign: "center",
    minHeight: "20px",
  },

  stepDescriptionStyle: {
    fontSize: "13px",
    color: "#6b7280",
    lineHeight: "1.3",
    marginTop: "6px",
    textAlign: "center",
    minHeight: "18px",
  },

  stepIconStyle: {
    fontSize: "20px",
  },

  // Logo section content styles
  logoEmojiStyle: {
    fontSize: "64px",
    marginBottom: "20px",
    color: "#fff",
  },

  logoTitleStyle: {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "12px",
    color: "#fff",
  },

  logoSubtitleStyle: {
    fontSize: "15px",
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: "1.5",
  },

  securityFeaturesStyle: {
    marginTop: "40px",
    textAlign: "left",
  },

  securityFeatureItemStyle: {
    marginBottom: "12px",
    fontSize: "14px",
  },
};