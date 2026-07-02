import { useState } from "react";
import { useNavigate } from "react-router";
import Header from "../../Components/Header/Header";
import "./SignUp.css";

const SignUpPage = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    country: "",
    city: "",
    gender: "",
    receiveTips: false,
    birthDate: "",
    password: "",
  });

  const navigate = useNavigate();

  const goNext = () => {
    // Validation per step
    if (currentStep === 1 && !formData.email.trim()) {
      alert("Please enter your email");
      return;
    }

    if (currentStep === 2 && !formData.name.trim()) {
      alert("Please enter your name");
      return;
    }

    if (
      currentStep === 3 &&
      (!formData.country.trim() || !formData.city.trim())
    ) {
      alert("Please enter country and city");
      return;
    }

    if (currentStep === 4 && !formData.gender) {
      alert("Please select a gender");
      return;
    }
    if (currentStep === 5 && !formData.birthDate) {
      alert("Please fulfill the password requirement of 8 characters first.");
      return;
    }


    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const onSubmitSuccess = () => {
    navigate("/profile-maker");
    console.log("Signup successful! Navigating to profile maker...");
  }

  const handleSubmit = async () => {
    if (formData.password.length < 8) {
      alert("Please fulfill the password requirement of 8 characters first.");
      return;
    }

    const userDetails = {
      email: formData.email,
      name: formData.name,
      location: `${formData.city}, ${formData.country}`,
      gender: formData.gender,
      birthDate: formData.birthDate,
      password: formData.password,
    };
    const url = `${import.meta.env.VITE_API_URL}/signup`;

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userDetails),
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      console.log("Signup response:", data);

      if (response.ok) {
        localStorage.setItem("userEmail", formData.email);
        onSubmitSuccess();
      } else {
        alert(data.message || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup connection error:", error);
      alert("Note: Connecting to signup backend failed. Proceeding to profile-maker for demo/testing.");
      localStorage.setItem("userEmail", formData.email || "demo@example.com");
      onSubmitSuccess();
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const toggleOpt = () => {
    setFormData((prev) => ({
      ...prev,
      receiveTips: !prev.receiveTips,
    }));
  };

  // Get current date string (YYYY-MM-DD) for max attribute constraint
  const getTodayDateString = () => {
    return new Date().toISOString().split("T")[0];
  };

  return (
    <div>
      <Header />

      <div className="dd-shell">
        <div className="dd-inner">
          {/* Progress Tracker Bar */}
          <div className="dd-steps">
            <div className={`dd-step ${currentStep >= 1 ? "on" : ""}`}></div>
            <div className={`dd-step ${currentStep >= 2 ? "on" : ""}`}></div>
            <div className={`dd-step ${currentStep >= 3 ? "on" : ""}`}></div>
            <div className={`dd-step ${currentStep >= 4 ? "on" : ""}`}></div>
            <div className={`dd-step ${currentStep >= 5 ? "on" : ""}`}></div>
            <div className={`dd-step ${currentStep >= 6 ? "on" : ""}`}></div>
          </div>

          <p className="dd-eyebrow">Create your account</p>

          {/* STEP 1 */}
          {currentStep === 1 && (
            <>
              <h1 className="dd-h1">
                What's your
                <br />
                email?
              </h1>

              <p className="dd-p">
                We'll send your duo invite here. No spam, ever.
              </p>

              <div className="dd-field">
                <div className="dd-field-wrap">
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />

                  {formData.email.includes("@") && (
                    <i
                      className="ti ti-check dd-tick"
                      aria-hidden="true"
                    ></i>
                  )}
                </div>
              </div>

              <div className="dd-opt" onClick={toggleOpt}>
                <div
                  className={`dd-box ${formData.receiveTips ? "on" : ""
                    }`}
                >
                  {formData.receiveTips && (
                    <i className="ti ti-check"></i>
                  )}
                </div>

                <p>
                  Send me <b>date ideas & match tips</b> from DoubleDate
                </p>
              </div>
            </>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <div className="dd-opt-name">
              <h1 className="dd-h1">
                What's your
                <br />
                Name?
              </h1>

              <p className="dd-p">
                Let us know what to call you!
              </p>
              <p>First Name</p>

              <div className="dd-field">

                <div className="dd-field-wrap">
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Alex"
                    autoComplete="given-name"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div className="dd-opt-name">
              <h1 className="dd-h1">Where do you live?</h1>

              <div className="dd-field">
                <div className="dd-field-wrap">
                  <input
                    type="text"
                    id="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Country"
                    autoComplete="country"
                  />
                </div>

                <div className="dd-field-wrap">
                  <input
                    type="text"
                    id="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    autoComplete="address-level2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {currentStep === 4 && (
            <div>
              <h1 className="dd-h1">About Me</h1>

              <p className="dd-p">I am</p>

              <div
                className="dd-alts"
              // style={{
              //   flexDirection: "column",
              //   gap: "10px"
              // }}
              >
                <div
                  className={`dd-opt ${formData.gender === "male" ? "on" : ""
                    }`}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      gender: "male",
                    }))
                  }
                  style={{
                    padding: "16px",
                    cursor: "pointer",
                  }}
                >
                  <div
                    className={`dd-box ${formData.gender === "male" ? "on" : ""
                      }`}
                  >
                    {formData.gender === "male" && (
                      <i className="ti ti-check"></i>
                    )}
                  </div>

                  <p>Man</p>
                </div>

                <div
                  className={`dd-opt ${formData.gender === "female" ? "on" : ""
                    }`}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      gender: "female",
                    }))
                  }
                  style={{
                    padding: "16px",
                    cursor: "pointer",
                  }}
                >
                  <div
                    className={`dd-box ${formData.gender === "female" ? "on" : ""
                      }`}
                  >
                    {formData.gender === "female" && (
                      <i className="ti ti-check"></i>
                    )}
                  </div>

                  <p>Woman</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5 - BIRTH DATE */}
          {currentStep === 5 && (
            <div className="dd-opt-name">
              <h1 className="dd-h1">
                What's your
                <br />
                birth date?
              </h1>

              <p className="dd-p">
                We use this to calculate your age and personalize your experience.
              </p>

              <div className="dd-field">

                <div className="dd-field-wrap">
                  <input
                    type="date"
                    id="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    max={getTodayDateString()}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div>
              <h1 className="dd-h1">
                Choose a
                <br />
                password
              </h1>
              <p className="dd-p">Make sure it's secure to protect your account details.</p>

              <div className="field-group" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div className="dd-field-wrap">
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                  />
                  {formData.password.length >= 8 && (
                    <i className="ti ti-check dd-tick" style={{ color: "#10b981" }} aria-hidden="true"></i>
                  )}
                </div>

                {formData.password.length > 0 && formData.password.length < 8 && (
                  <p className="dd-err-msg" style={{ display: "block", color: "#ef4444" }}>
                    Password must be at least 8 digits long
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Form Action Buttons */}
          <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="dd-btn-secondary"
              >
                Back
              </button>
            )}

            {currentStep < 6 ? (
              <button type="button" onClick={goNext} className="dd-btn-primary">
                Continue
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} className="dd-btn-primary">
                Submit
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
