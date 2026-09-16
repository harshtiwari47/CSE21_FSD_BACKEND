function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(() => resolve("true"), ms);
    })
}

const getUser = async (name, password) => {
  return new Promise(async (resolve, reject) => {
    await wait(3000);

    if (password === "abc") {
      resolve("Logged In");
    } else {
      reject(new Error("Password is incorrect", {
        cause: "wrong_password"
      }));
    }
  });
};

(async () => {
  await getUser("harsh", "abcx")
    .then(() => {
      console.log("login success");
    })
    .catch((err) => {
      console.log("login failed", err);
    });
})();
