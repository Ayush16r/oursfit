const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://oursfit1_db_user:STs9g4w7nbyMLdJO@oursfit.mrtup28.mongodb.net/oursfit?retryWrites=true&w=majority&appName=oursfit";

async function run() {
  const client = new MongoClient(uri);
  try {
    console.log("Attempting to connect...");
    await client.connect();
    console.log("Connected successfully to server");
  } catch (err) {
    console.error("Connection failed!");
    console.error(err);
  } finally {
    await client.close();
  }
}
run();
