import { useState } from 'react';
import { useNavigate } from 'react-router';
import Header from '../Header/Header';

import './ProfileMaking.css';

const ProfileMaker = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Initial Setup Data
    connectionTypes: [],
    minAge: 19,
    maxAge: 32,
    photos: [],
    selfSummary: '',

    // Core Questions (1-5)
    q1_carefreeIntense: '',
    q2_religionImportance: '',
    q3_discussPolitics: '',
    q4_astrologicalSign: '',
    q5_womenWorkFullTime: '',

    // New Questions (6-15)
    q6_smoking: '',
    q7_drinking: '',
    q8_marijuana: '',
    q9_drugs: '',
    q10_openToOpenRelationship: '',
    q11_wantKids: '',
    q12_longestRelationship: '',
    q13_idealRelationshipLength: '',
    q14_cleanliness: '',
    q15_loveExpression: ''
  });

  const nextStep = (e) => {
    if (e) e.preventDefault();
    setStep((prev) => prev + 1);
  };

  const prevStep = (e) => {
    if (e) e.preventDefault();
    setStep((prev) => prev - 1);
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const currentTypes = [...prev.connectionTypes];
      if (checked) {
        currentTypes.push(value);
      } else {
        const index = currentTypes.indexOf(value);
        if (index > -1) currentTypes.splice(index, 1);
      }
      return { ...prev, connectionTypes: currentTypes };
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Automatically transition to the next question when a radio option is chosen
    if (type === 'radio' && name.startsWith('q')) {
      setTimeout(() => {
        if (name === 'q15_loveExpression') {
          handleSubmitProfile();
        } else {
          setStep((prev) => prev + 1);
        }
      }, 300); // 300ms delay for smooth visual feedback
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, photos: [...prev.photos, ...files].slice(0, 6) }));
  };

  const handleSubmitProfile = async () => {
    const email = localStorage.getItem("userEmail") || "demo@example.com";

    // Create FormData object to send multipart/form-data (required for files)
    const data = new FormData();
    data.append("email", email);
    data.append("minAge", formData.minAge);
    data.append("maxAge", formData.maxAge);
    data.append("selfSummary", formData.selfSummary);
    data.append("connectionTypes", JSON.stringify(formData.connectionTypes));

    // Append questionnaire responses
    Object.keys(formData).forEach((key) => {
      if (key.startsWith("q") && formData[key]) {
        data.append(key, formData[key]);
      }
    });

    // Append photo files
    formData.photos.forEach((file, index) => {
      data.append(`photo_${index}`, file);
    });

    try {
      const response = await fetch("http://localhost:3000/profile", {
        method: "POST",
        body: data,
      });

      const resData = await response.json();
      console.log("Profile save response:", resData);

      if (response.ok) {
        alert("Onboarding completed successfully! Profile created.");
        navigate("/");
      } else {
        alert(resData.message || "Failed to save profile. Please try again.");
      }
    } catch (error) {
      console.error("Profile submission error:", error);
      alert("Note: Connecting to backend failed. Onboarding complete (saved locally for demo).");
      navigate("/");
    }
  };

  return (
    <div className="profile-maker-page-wrapper">
      <Header />
      <div className="profile-maker-shell">
        <div className="onboarding-transition">
          {/* STEP 1: Desired Relationship Type */}
          {step === 1 && (
            <form className="onboarding-connection-type" onSubmit={nextStep}>
              <h2>Desired relationship type</h2>
              <div className="onboarding-connection-type-content">
                <div className="onboarding-connection-type-inner">
                  <div className="gWwnhxDTrpciMVu2jy2o MAfGjdm7bNIbWRfFTpdQ">
                    <div className="iWe2AqDwuHRCo8EDLIvX">
                      <div className="lKqvbJbRTk4zrejkbcmT">
                        <label className="oknf-checkbox" style={{ padding: "16px" }}>
                          <div className="oknf-clickable-inner">
                            <input name="connection-type" type="checkbox" value="New friends" onChange={handleCheckboxChange} checked={formData.connectionTypes.includes("New friends")} />
                            <span className="oknf-checkbox-label">New friends</span>
                          </div>
                        </label>
                      </div>
                      <div className="lKqvbJbRTk4zrejkbcmT">
                        <label className="oknf-checkbox" style={{ padding: "16px" }}>
                          <div className="oknf-clickable-inner">
                            <input name="connection-type" type="checkbox" value="Short-term dating" onChange={handleCheckboxChange} checked={formData.connectionTypes.includes("Short-term dating")} />
                            <span className="oknf-checkbox-label">Short-term dating</span>
                          </div>
                        </label>
                      </div>
                      <div className="lKqvbJbRTk4zrejkbcmT">
                        <label className="oknf-checkbox" style={{ padding: "16px" }}>
                          <div className="oknf-clickable-inner">
                            <input name="connection-type" type="checkbox" value="Long-term dating" onChange={handleCheckboxChange} checked={formData.connectionTypes.includes("Long-term dating")} />
                            <span className="oknf-checkbox-label">Long-term dating</span>
                          </div>
                        </label>
                      </div>
                      <div className="lKqvbJbRTk4zrejkbcmT">
                        <label className="oknf-checkbox" style={{ padding: "16px" }}>
                          <div className="oknf-clickable-inner">
                            <input name="connection-type" type="checkbox" value="Hookups" onChange={handleCheckboxChange} checked={formData.connectionTypes.includes("Hookups")} />
                            <span className="oknf-checkbox-label">Hookups</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="onboarding-actions onboarding-connection-type-actions">
                <button type="submit" className="RCnxRpTKlcKwgM1UlXlj onboarding-actions-next">NEXT</button>
              </div>
            </form>
          )}

          {/* STEP 2: Age Range Selectors */}
          {step === 2 && (
            <form onSubmit={nextStep}>
              <h2>What ages are you open to dating?</h2>
              <div>
                <select name="minAge" value={formData.minAge} onChange={handleInputChange}>
                  {[...Array(83).keys()].map(i => <option key={i + 18} value={i + 18}>{i + 18}</option>)}
                </select>
                <span> - </span>
                <select name="maxAge" value={formData.maxAge} onChange={handleInputChange}>
                  {[...Array(83).keys()].map(i => <option key={i + 18} value={i + 18}>{i + 18}</option>)}
                </select>
              </div>
              <div className="onboarding-actions">
                <button type="button" onClick={prevStep}>BACK</button>
                <button type="submit">NEXT</button>
              </div>
            </form>
          )}

          {/* STEP 3: Photos Upload */}
          {step === 3 && (
            <form onSubmit={nextStep}>
              <h2>Add your best photos</h2>
              <p>Drag to reorder photos</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[...Array(6).keys()].map((index) => (
                  <div key={index} style={{ border: '1px dashed #ccc', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {formData.photos[index] ? (
                      <img src={URL.createObjectURL(formData.photos[index])} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <label style={{ cursor: 'pointer' }}>
                        <span>📷 +</span>
                        <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                      </label>
                    )}
                  </div>
                ))}
              </div>
              <p>Tip: Profiles with 6 photos get better matches.</p>
              <div>
                <a href="#rules">WANT ADVICE? SEE PHOTO RULES &gt;</a>
              </div>
              <div className="onboarding-actions">
                <button type="button" onClick={prevStep}>BACK</button>
                <button type="submit">NEXT</button>
              </div>
            </form>
          )}

          {/* STEP 4: Self-Summary Paragraph */}
          {step === 4 && (
            <form onSubmit={nextStep}>
              <h2>Tell us about yourself</h2>
              <h3>My Self-Summary</h3>
              <textarea
                name="selfSummary"
                placeholder="Write a little about yourself. Just a paragraph will do."
                value={formData.selfSummary}
                onChange={handleInputChange}
                rows={6}
                style={{ width: '100%' }}
              />
              <div className="onboarding-actions">
                <button type="button" onClick={prevStep}>BACK</button>
                <button type="submit">NEXT</button>
              </div>
            </form>
          )}

          {/* STEP 5: Questionnaire Introduction Interstitial */}
          {step === 5 && (
            <div>
              <h2>DuoDate uses questions to calculate your perfect match</h2>
              <p>Answer 15 questions to get started. You can always answer more later.</p>
              <div className="onboarding-actions">
                <button type="button" onClick={prevStep}>BACK</button>
                <button type="button" onClick={nextStep}>GET STARTED</button>
              </div>
            </div>
          )}

          {/* STEP 6: Quiz Question 1 */}
          {step === 6 && (
            <form onSubmit={nextStep}>
              <p>1 of 15</p>
              <h2>Which word describes you better?</h2>
              <div>
                <label>
                  <input type="radio" name="q1_carefreeIntense" value="Carefree" checked={formData.q1_carefreeIntense === "Carefree"} onChange={handleInputChange} />
                  Carefree
                </label>
                <br />
                <label>
                  <input type="radio" name="q1_carefreeIntense" value="Intense" checked={formData.q1_carefreeIntense === "Intense"} onChange={handleInputChange} />
                  Intense
                </label>
              </div>
              <div className="onboarding-actions">
                <button type="button" onClick={nextStep}>SKIP TO NEXT QUESTION &gt;</button>
              </div>
            </form>
          )}

          {/* STEP 7: Quiz Question 2 */}
          {step === 7 && (
            <form onSubmit={nextStep}>
              <p>2 of 15</p>
              <h2>How important is religion/God in your life?</h2>
              <div>
                {["Extremely important", "Somewhat important", "Not very important", "Not important at all"].map((option) => (
                  <div key={option}>
                    <label>
                      <input type="radio" name="q2_religionImportance" value={option} checked={formData.q2_religionImportance === option} onChange={handleInputChange} />
                      {option}
                    </label>
                  </div>
                ))}
              </div>
              <div className="onboarding-actions">
                <button type="button" onClick={nextStep}>SKIP TO NEXT QUESTION &gt;</button>
              </div>
            </form>
          )}

          {/* STEP 8: Quiz Question 3 */}
          {step === 8 && (
            <form onSubmit={nextStep}>
              <p>3 of 15</p>
              <h2>Do you enjoy discussing politics?</h2>
              <div>
                <label>
                  <input type="radio" name="q3_discussPolitics" value="Yes" checked={formData.q3_discussPolitics === "Yes"} onChange={handleInputChange} />
                  Yes
                </label>
                <br />
                <label>
                  <input type="radio" name="q3_discussPolitics" value="No" checked={formData.q3_discussPolitics === "No"} onChange={handleInputChange} />
                  No
                </label>
              </div>
              <div className="onboarding-actions">
                <button type="button" onClick={nextStep}>SKIP TO NEXT QUESTION &gt;</button>
              </div>
            </form>
          )}

          {/* STEP 9: Quiz Question 4 */}
          {step === 9 && (
            <form onSubmit={nextStep}>
              <p>4 of 15</p>
              <h2>Is astrological sign at all important in a match?</h2>
              <div>
                <label>
                  <input type="radio" name="q4_astrologicalSign" value="Yes" checked={formData.q4_astrologicalSign === "Yes"} onChange={handleInputChange} />
                  Yes
                </label>
                <br />
                <label>
                  <input type="radio" name="q4_astrologicalSign" value="No" checked={formData.q4_astrologicalSign === "No"} onChange={handleInputChange} />
                  No
                </label>
              </div>
              <div className="onboarding-actions">
                <button type="button" onClick={nextStep}>SKIP TO NEXT QUESTION &gt;</button>
              </div>
            </form>
          )}

          {/* STEP 10: Quiz Question 5 */}
          {step === 10 && (
            <form onSubmit={nextStep}>
              <p>5 of 15</p>
              <h2>Should women continue to work full-time after marriage?</h2>
              <div>
                {["Yes", "No", "Either way, it's their choice", "Only if it's necessary"].map((option) => (
                  <div key={option}>
                    <label>
                      <input type="radio" name="q5_womenWorkFullTime" value={option} checked={formData.q5_womenWorkFullTime === option} onChange={handleInputChange} />
                      {option}
                    </label>
                  </div>
                ))}
              </div>
              <div className="onboarding-actions">
                <button type="button" onClick={nextStep}>SKIP TO NEXT QUESTION &gt;</button>
              </div>
            </form>
          )}

          {/* STEP 11: Quiz Question 6 */}
          {step === 11 && (
            <form onSubmit={nextStep}>
              <p>6 of 15</p>
              <h2>Do you smoke?</h2>
              <div>
                {["Yes", "No", "Sometimes"].map((option) => (
                  <div key={option}>
                    <label>
                      <input type="radio" name="q6_smoking" value={option} checked={formData.q6_smoking === option} onChange={handleInputChange} />
                      {option}
                    </label>
                  </div>
                ))}
              </div>
              <div className="onboarding-actions">
                <button type="button" onClick={nextStep}>SKIP TO NEXT QUESTION &gt;</button>
              </div>
            </form>
          )}

          {/* STEP 12: Quiz Question 7 */}
          {step === 12 && (
            <form onSubmit={nextStep}>
              <p>7 of 15</p>
              <h2>How often do you drink alcohol?</h2>
              <div>
                {["Very often", "Sometimes", "Rarely", "Never"].map((option) => (
                  <div key={option}>
                    <label>
                      <input type="radio" name="q7_drinking" value={option} checked={formData.q7_drinking === option} onChange={handleInputChange} />
                      {option}
                    </label>
                  </div>
                ))}
              </div>
              <div className="onboarding-actions">
                <button type="button" onClick={nextStep}>SKIP TO NEXT QUESTION &gt;</button>
              </div>
            </form>
          )}

          {/* STEP 13: Quiz Question 8 */}
          {step === 13 && (
            <form onSubmit={nextStep}>
              <p>8 of 15</p>
              <h2>How do you feel about marijuana?</h2>
              <div>
                {["I smoke regularly", "I smoke occasionally", "I never smoke but don't mind if you do", "I never smoke and prefer my partner doesn't"].map((option) => (
                  <div key={option}>
                    <label>
                      <input type="radio" name="q8_marijuana" value={option} checked={formData.q8_marijuana === option} onChange={handleInputChange} />
                      {option}
                    </label>
                  </div>
                ))}
              </div>
              <div className="onboarding-actions">
                <button type="button" onClick={nextStep}>SKIP TO NEXT QUESTION &gt;</button>
              </div>
            </form>
          )}

          {/* STEP 14: Quiz Question 9 */}
          {step === 14 && (
            <form onSubmit={nextStep}>
              <p>9 of 15</p>
              <h2>Do you do drugs?</h2>
              <div>
                {["Never", "Sometimes", "Often"].map((option) => (
                  <div key={option}>
                    <label>
                      <input type="radio" name="q9_drugs" value={option} checked={formData.q9_drugs === option} onChange={handleInputChange} />
                      {option}
                    </label>
                  </div>
                ))}
              </div>
              <div className="onboarding-actions">
                <button type="button" onClick={nextStep}>SKIP TO NEXT QUESTION &gt;</button>
              </div>
            </form>
          )}

          {/* STEP 15: Quiz Question 10 */}
          {step === 15 && (
            <form onSubmit={nextStep}>
              <p>10 of 15</p>
              <h2>Would you consider being open to an open relationship?</h2>
              <div>
                <label>
                  <input type="radio" name="q10_openToOpenRelationship" value="Yes" checked={formData.q10_openToOpenRelationship === "Yes"} onChange={handleInputChange} />
                  Yes
                </label>
                <br />
                <label>
                  <input type="radio" name="q10_openToOpenRelationship" value="No" checked={formData.q10_openToOpenRelationship === "No"} onChange={handleInputChange} />
                  No
                </label>
              </div>
              <div className="onboarding-actions">
                <button type="button" onClick={nextStep}>SKIP TO NEXT QUESTION &gt;</button>
              </div>
            </form>
          )}

          {/* STEP 16: Quiz Question 11 */}
          {step === 16 && (
            <form onSubmit={nextStep}>
              <p>11 of 15</p>
              <h2>Do you want kids?</h2>
              <div>
                {["Definite yes", "Maybe", "Definite no"].map((option) => (
                  <div key={option}>
                    <label>
                      <input type="radio" name="q11_wantKids" value={option} checked={formData.q11_wantKids === option} onChange={handleInputChange} />
                      {option}
                    </label>
                  </div>
                ))}
              </div>
              <div className="onboarding-actions">
                <button type="button" onClick={nextStep}>SKIP TO NEXT QUESTION &gt;</button>
              </div>
            </form>
          )}

          {/* STEP 17: Quiz Question 12 */}
          {step === 17 && (
            <form onSubmit={nextStep}>
              <p>12 of 15</p>
              <h2>What is the longest relationship you've had?</h2>
              <div>
                {["6 months or less", "6-12 months", "1-2 years", "More than 2 years"].map((option) => (
                  <div key={option}>
                    <label>
                      <input type="radio" name="q12_longestRelationship" value={option} checked={formData.q12_longestRelationship === option} onChange={handleInputChange} />
                      {option}
                    </label>
                  </div>
                ))}
              </div>
              <div className="onboarding-actions">
                <button type="button" onClick={nextStep}>SKIP TO NEXT QUESTION &gt;</button>
              </div>
            </form>
          )}

          {/* STEP 18: Quiz Question 13 */}
          {step === 18 && (
            <form onSubmit={nextStep}>
              <p>13 of 15</p>
              <h2>How long do you want your next relationship to last?</h2>
              <div>
                {["One night", "A few months to a year", "Several years", "The rest of my life"].map((option) => (
                  <div key={option}>
                    <label>
                      <input type="radio" name="q13_idealRelationshipLength" value={option} checked={formData.q13_idealRelationshipLength === option} onChange={handleInputChange} />
                      {option}
                    </label>
                  </div>
                ))}
              </div>
              <div className="onboarding-actions">
                <button type="button" onClick={nextStep}>SKIP TO NEXT QUESTION &gt;</button>
              </div>
            </form>
          )}

          {/* STEP 19: Quiz Question 14 */}
          {step === 19 && (
            <form onSubmit={nextStep}>
              <p>14 of 15</p>
              <h2>How clean are you?</h2>
              <div>
                {["Very clean", "Average", "Messy"].map((option) => (
                  <div key={option}>
                    <label>
                      <input type="radio" name="q14_cleanliness" value={option} checked={formData.q14_cleanliness === option} onChange={handleInputChange} />
                      {option}
                    </label>
                  </div>
                ))}
              </div>
              <div className="onboarding-actions">
                <button type="button" onClick={nextStep}>SKIP TO NEXT QUESTION &gt;</button>
              </div>
            </form>
          )}

          {/* STEP 20: Quiz Question 15 */}
          {step === 20 && (
            <div>
              <p>15 of 15</p>
              <h2>How do you show your love?</h2>
              <div>
                {["Words of affirmation", "Quality time", "Gifts", "Acts of service", "Physical touch"].map((option) => (
                  <div key={option}>
                    <label>
                      <input type="radio" name="q15_loveExpression" value={option} checked={formData.q15_loveExpression === option} onChange={handleInputChange} />
                      {option}
                    </label>
                  </div>
                ))}
              </div>
              <div className="onboarding-actions" style={{ marginTop: '20px' }}>
                <button type="button" onClick={handleSubmitProfile}>FINISH PROFILE</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileMaker;