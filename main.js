import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ========================================================
// 1. MOCKUP: THE SVG WIRE ANIMATION
// ========================================================
const wirePath = document.querySelector('#wire-path');
const spark = document.querySelector('#spark');

// Prepare the SVG line drawing by calculating its total length
const pathLength = wirePath.getTotalLength();
wirePath.style.strokeDasharray = pathLength;
wirePath.style.strokeDashoffset = pathLength; // Hide initially

// Draw the wire as we scroll down the first section (Hero)
gsap.to(wirePath, {
  strokeDashoffset: 0,
  ease: "none",
  scrollTrigger: {
    trigger: ".hero",
    start: "top top",
    end: "bottom top",
    scrub: true, // Smoothly link animation to scrollbar
  }
});

// The "Spark and Disappear" Cut Effect
// Triggered when the user scrolls into the Services section
ScrollTrigger.create({
  trigger: ".services",
  start: "center center",
  onEnter: () => {
    // Exact center of the screen
    const cutX = window.innerWidth * 0.5; 
    const cutY = window.innerHeight * 0.5;

    // Position the spark element right at the center cut point
    spark.style.left = `${cutX}px`;
    spark.style.top = `${cutY}px`;

    // Create the fast "Zap" timeline
    const tl = gsap.timeline();
    
    tl.to(spark, { opacity: 1, scale: 3, duration: 0.1 }) // Bright spark appears
      .to("body", { backgroundColor: "#ff3300", duration: 0.05 }, "<") // Quick red/orange flash
      .to("body", { backgroundColor: "#050505", duration: 0.15 }) // Fade back to black
      .to(wirePath, { opacity: 0, duration: 0.1 }, "<") // The wire vanishes!
      .to(spark, { opacity: 0, scale: 0, duration: 0.2 }); // Spark fizzles out
  },
  onLeaveBack: () => {
    // If they scroll back up, seamlessly bring the wire back
    gsap.to(wirePath, { opacity: 1, duration: 0.2 });
  }
});

// ========================================================
// INSTRUCTIONS FOR ADDING YOUR OWN VIDEO LATER
// ========================================================
/**
 * When your custom video/animation is ready:
 * 
 * 1. Drop your video file (e.g., 'cutting-wire.mp4') into the /public/ folder.
 * 2. In index.html, uncomment the <video id="user-video-placeholder"> tag.
 * 3. Update the source attribute to point to your file: src="/cutting-wire.mp4".
 * 4. You can use the logic below to play it when scrolled!
 */

/*
const myVideo = document.querySelector('#user-video-placeholder');

ScrollTrigger.create({
  trigger: ".services",
  start: "center center",
  onEnter: () => {
     // Ensure video is visible and play it
     myVideo.style.display = "block";
     myVideo.play();
  },
  onLeaveBack: () => {
     // Reset it if they scroll back up
     myVideo.pause();
     myVideo.currentTime = 0;
  }
});
*/
