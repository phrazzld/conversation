const fs = require('fs');

if (process.env.GCP_KEY_FILE) {
  fs.writeFile(process.env.GCP_KEY_FILE, process.env.GCP_CRED, err => {
    if (err) {
      console.error(`Uh-oh.\n${err}`);
    } else {
      console.log(`We're smooth sailing cap'n.`);
    }
  });
} else {
  console.log(`GCP_KEY_FILE not found.`);
}
