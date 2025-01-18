import "robot3/debug";

// Only enable debug mode in development
if (process.env.NODE_ENV === "development") {
  console.log("Robot3 debug mode enabled");
}
