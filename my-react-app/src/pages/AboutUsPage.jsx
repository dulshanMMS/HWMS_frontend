// pages/AboutUs.jsx
import React from 'react';

// TODO: Import your existing Header component when ready
// import Header from '../components/Header';

// TODO: Import the Hero Section component when ready  
 import HeroSection from '../components/AboutUs/HeroSection';
 import ContentSection from '../components/AboutUs/ContentSection';
 import team1 from '../assets/team1.png';
 import team2 from '../assets/team2.png';
 import StatsSection from '../components/AboutUs/StatsSection';
 import parkinig_photo from '../assets/parking.jpeg';
 import mission from '../assets/mission.png';
 import Footer from '../components/AboutUs/footer';

const AboutUsPage = () => {
  return (
    <div className="min-h-screen bg-white"> {/* You can change this background color if content ekk danwnm , ar kola pata enne app.jsx eken Nemei dn meke indepency weda _he_he*/}
      
      {/* TODO: Add Header component when ready */}
      {/* <Header /> */}
      
      {/* Temporary content to test the page */}
    
      {/* TODO: Add Hero Section component when ready */}
       <HeroSection /> 
      
        {/* First Content Section - Welcome to Wiley Booking */}
      <ContentSection 
        imageLeft={true}
        title="Welcome to Wiley Booking!"
        description="At Wiley Booking, we understand the evolving needs of modern workplaces. Our mission is to simplify workspace management by providing innovative and user-friendly solutions tailored to the hybrid work environment. With the rise of flexible working, businesses and employees face challenges in managing shared resources like seats, parking, and collaborative spaces. Wiley Booking is here to solve those problems."
        imageSrc={team1}
        imageAlt="Welcome to Wiley Booking - Team collaboration"
      />
         {/* Second Content Section - Why Wiley Booking */}
      <ContentSection 
        imageLeft={false}
        title="Why Wiley Booking?"
        description="We eliminate the chaos and optimize your workspace for maximum efficiency and user satisfaction."
        imageSrc={team2}
        imageAlt="Modern office space"
        features={[
          {
            title: "Efficiency",
            description: "We eliminate the chaos of manual bookings and optimize space utilization."
          },
          {
            title: "Flexibility", 
            description: "Perfect for hybrid workplaces, enabling employees to plan their office visits with ease."
          },
          {
            title: "Transparency",
            description: "Real-time availability ensures users always have up-to-date information."
          },
          {
            title: "Innovation",
            description: "We leverage modern technology to meet the demands of tomorrow's workplace."
          }
        ]}
      />

      <StatsSection/>
       
       <ContentSection 
        imageLeft={true}
        title="Seamless Parking Experience"
        description="Our platform is designed to simplify the parking experience for drivers and businesses alike. We provide a seamless, user-friendly solution for reserving parking spots in advance, ensuring that you never have to stress about finding a place to park."
        imageSrc={parkinig_photo}
        imageAlt="Parking lot with multiple cars"
      />

      {/* Fourth Content Section - Our Mission (Image Right) */}
      <ContentSection 
        imageLeft={false}
        title="Our Mission"
        description="We aim to create a hassle-free parking experience by leveraging technology to connect drivers with available parking spaces. Our goal is to save time, reduce traffic congestion, and make urban mobility more efficient."
        imageSrc={mission}
        imageAlt="Team working in modern office environment"
      />

      <Footer/>
      
      {/* TODO: Add more sections here later */}
      
    </div>
  );
};

export default AboutUsPage;