// import express from "express";
// const app = express();
// app.use(express.json());
// let users = [
//   { id: 1, name: "John Doe", email: "john@example.com" },
//   { id: 2, name: "Jane Smith", email: "jane@example.com" },
// ];
// //GET:fetch all users data
// app.get("/users", (req, res) => {
//   res.json(users);
// });
// //POST: create a new user
// app.post("/users", (req, res) => {
//   let newUser = {
//     id: users.length + 1,
//     name: req.body.name,
//     email: req.body.email,
//   };
//   users.push(newUser);
//   res.json;
//   res.status(201).json(newUser);
// });
// app.put("/users/:id", (req, res) => {
//   let user = users.find((u) => u.id == req.params.id);
//   user.name = req.body.name;
//   user.email = req.body.email;
//   res.send("User Updated Successfully");
//   res.json(user);
// });

// //DELETE: delete a user by id
// app.delete("/users/:id", (req, res) => {
//   let index = users.findIndex((u) => u.id == req.params.id);
//   if (index === -1) {
//     return res.status(404).json({ message: "User not found" });
//   }
//   let deletedUser = users.splice(index, 1);
//   res.json({ message: "User Deleted Successfully", deletedUser });
// });

// app.listen(3000, () => {
//   console.log("Server is running on port http://localhost:3000");
// });

import express from "express";
import fs from "fs";
const app = express();
app.get("/", (req, res) => {
  fs.readFile("./rest/pages/home.html", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file", err);
      res.status(500).send("Error reading file", err);
      return;
    }
    res.send(data);
  });
});

app.listen(3000, () => {
  console.log("Server is running on port http://localhost:3000");
});
