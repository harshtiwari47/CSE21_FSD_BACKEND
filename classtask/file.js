import fs from "fs";

fs.writeFileSync("output.txt", "Hello, World!", (err) => {
  if (err) {
    console.error("Error writing to file:", err);
  } else {
    console.log("File written successfully.");
  }
});

fs.readFile("output.txt", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
  } else {
    console.log("File contents:", data);
  }
});

fs.appendFile("output.txt", "\nAppended text.", (err) => {
  if (err) {
    console.error("Error appending to file:", err);
  } else {
    console.log("Text appended successfully.");
  }
});

fs.unlink("output.txt", (err) => {
  if (err) {
    console.error("Error deleting file:", err);
  } else {
    console.log("File deleted successfully.");
  }
});
