import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import './Contact.css';

const Contact = () => {
  const form = useRef();
  const [status, setStatus] = useState(""); // To show success or error messages

  const sendEmail = (e) => {
    e.preventDefault();

    // Replace these strings with your actual EmailJS IDs
    // Service ID, Template ID, and Public Key
    emailjs.sendForm(
      'service_eursqxe', 
      'template_xup4mje', 
      form.current, 
      'YLAjLGPR4LkuUI-sq'
    )
      .then((result) => {
          console.log(result.text);
          setStatus("SUCCESS");
          form.current.reset(); // Clears the form
      }, (error) => {
          console.log(error.text);
          setStatus("ERROR");
      });
  };

  return (
    <section className="contact" id="contact">
      <div className="contact-container">
        
        <div className="contact-left">
          <h2 className="contact-title">Get in <span>Touch</span></h2>
          <p className="contact-description">
            Have a project in mind or just want to say hi? Feel free to reach out. 
            I'm always open to discussing new opportunities and creative ideas.
          </p>
          
          <div className="contact-details">
            <div className="contact-item">
              <h4>Email</h4>
              <p>tjansenzb2021@gmail.com</p>
            </div>
            <div className="contact-item">
              <h4>Location</h4>
              <p>Meycauayan City, Bulacan, Philippines</p>
            </div>
            <div className="contact-item">
              <h4>Contact Number</h4>
              <p>+63 976-056-3152</p>
            </div>
          </div>
        </div>

        <div className="contact-right">
          <form ref={form} className="contact-form" onSubmit={sendEmail}>
            <div className="input-row">
              <input type="text" name="user_name" placeholder="Your Name" required />
              <input type="email" name="user_email" placeholder="Your Email" required />
            </div>
            <input type="text" name="subject" placeholder="Subject" required />
            <textarea name="message" rows="8" placeholder="How can I help you?" required></textarea>
            
            <div className="contact-submit">
              <button type="submit" className="contact-btn">
                <span>{status === "" ? "Send Message" : status === "SUCCESS" ? "Message Sent!" : "Error!"}</span>
              </button>
            </div>
            
            {status === "SUCCESS" && <p className="status-msg success">Email sent successfully!</p>}
            {status === "ERROR" && <p className="status-msg error">Something went wrong. Please try again.</p>}
          </form>
        </div>

      </div>
    </section>
  );
};

export default Contact;