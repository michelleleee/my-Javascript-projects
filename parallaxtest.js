let controller = new ScrollMagic.Controller();
let timeline = new TimelineMax();

timeline
  .to(".covid1", 15, { y: -100 })  
  .to(".covid2", 10, { y: -100 })
  .to(".TB1", 15, { y: -100 })
  .to(".TB2", 20, { y: -100 })
  .to(".nurse", 50, { y: -95 }, "-=50")
  .fromTo(".OR", { y: -50 }, { y: 0, duration: 10 }, "-=10")
  .to(".content", 10, { top: "10%" }, "-=10")
  .fromTo(".content-images", { opacity: 0 }, { opacity: 1, duration: 3 })
  .fromTo(".text", { opacity: 0 }, { opacity: 1, duration: 3 });

let scene = new ScrollMagic.Scene({
  triggerElement: "section",
  duration: "400%",
  triggerHook: 0,
})
  .setTween(timeline)
  .setPin("section")
  .addTo(controller);