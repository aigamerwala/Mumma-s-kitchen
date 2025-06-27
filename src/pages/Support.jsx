import React, { useState } from "react";
import { supabase } from "../supabaseClient";

const Enquiry = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    message: "",
    attachment: null,
  });

  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevState) => ({
        ...prevState,
        attachment: file,
      }));
      // Create preview URL for image or generic file
      const url = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, phone, email, message } = formData;

    if (!firstName || !lastName || !phone || !email || !message) {
      setError("Please fill in all fields before submitting.");
      return;
    }
    
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    let filePath;
    if (formData.attachment) {
      filePath = `enquiry/attachments/${formData.attachment.name}_${Date.now()}`;
    }
    else filePath = null;
    console.log("Enquiry Submitted:", formData);
    const { error } = await supabase.from("enquiry").insert({
      firstName: firstName,
      lastName: lastName,
      phone: phone,
      email: email,
      message: message,
      attachment: filePath,
    });
    
    if (error) {
      console.error("Error submitting enquiry:", error);
      setError("Failed to submit enquiry. Please try again.");
      return;
    }
    if(filePath){
    const { error: uploadError } = await supabase.storage
        .from("enquiry-attachments")
        .upload(filePath, formData.attachment, {
          cacheControl: "3600",
          upsert: false,
        });
      if (uploadError) {
        console.error("Error uploading attachment:", uploadError);
        setError("Failed to upload attachment. Please try again.");
        return;
      }
    }
    console.log("Attachment uploaded successfully!");
    alert("Thanks for your enquiry! We will get in touch with you shortly.");
    setFormData({ firstName: "", lastName: "", phone: "", email: "", message: "", attachment: null });
    setPreviewUrl(null);
    setError("");
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border border-gray-200 fade-in transform hover:scale-105 transition-all duration-500 mb-20">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Ticket Submission</h2>
      <p className="text-gray-600 text-center mb-10 text-lg">We will get in touch with you shortly</p>
      <form className="space-y-8">
        <div className="flex justify-between space-x-6">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            className="w-1/2 px-6 py-4 border-2 border-gray-300 rounded-xl input-focus hover:scale-105 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white transition-all duration-300"
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            className="w-1/2 px-6 py-4 border-2 border-gray-300 rounded-xl input-focus hover:scale-105 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white transition-all duration-300"
            required
          />
        </div>
        <div className="flex justify-between space-x-6">
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number (10 digits)"
            value={formData.phone}
            onChange={handleChange}
            className="w-1/2 px-6 py-4 border-2 border-gray-300 rounded-xl input-focus hover:scale-105 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white transition-all duration-300"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your E-mail Address"
            value={formData.email}
            onChange={handleChange}
            className="w-1/2 px-6 py-4 border-2 border-gray-300 rounded-xl input-focus hover:scale-105 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white transition-all duration-300"
            required
          />
        </div>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <textarea
          name="message"
          placeholder="Leave Your Message"
          value={formData.message}
          onChange={handleChange}
          className="w-full px-6 py-5 border-2 border-gray-300 rounded-xl input-focus hover:scale-105 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white transition-all duration-300 h-40 resize-none"
          required
        />
        {previewUrl && (
          <div className="mt-4 text-center">
            <p className="text-gray-700 mb-2">Preview:</p>
            <img src={previewUrl} alt="Attachment Preview" className="max-w-xs max-h-40 mx-auto rounded-lg shadow-md" />
          </div>
        )}
        {!previewUrl && formData.attachment && (
          <p className="text-gray-700 text-center">Attachment: {formData.attachment.name} (Preview unavailable)</p>
        )}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-3/5 bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 rounded-xl hover:from-blue-700 hover:to-blue-900 hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold text-lg"
          >
            Submit
          </button>
          <label className="w-1/5 bg-gray-300 text-gray-700 py-4 rounded-xl hover:bg-gray-400 hover:scale-105 transition-all duration-300 font-semibold text-lg text-center cursor-pointer">
            Attached
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="*/*"
            />
          </label>
        </div>
      </form>
    </div>
  );
};

export default Enquiry;