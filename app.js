const fs = require("fs");
const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const Member = require("./models/user");

app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/register', (req, res) => {
  res.render('register');
});
app.get('/homepage', (req, res) => {
  res.render('homepage');
});

app.post("/register", async (req, res) => {
  try {
    const { name, password, email, projects, skills } = req.body;

    const userData = {
      name: name,
      password: password,
      email: email,
      projects: projects.split(',').map(project => project.trim()), // Split and trim projects
      skills: skills.split(',').map(skill => skill.trim()), // Split and trim skills
    };

    await Member.create(userData);

    // Redirect to the login page after successful registration
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.send("An error occurred during signup.");
  }
});

// Login route
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Authenticate the user
  const user = await Member.findOne({ name: username, password: password });

  if (user) {
    // Redirect to the user's portfolio page after successful login
    res.redirect(`/user-portfolio/${user.name}`);
  } else {
    res.send('Invalid credentials');
  }
});

app.get('/admin', (req, res) => {
  res.render('admin-login');
});

app.get('/admin-login', (req, res) => {
  res.render('admin-login');
});

app.post('/admin', async (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    res.redirect('/admin-portfolio');
  } else {
    res.send('Invalid admin credentials');
  }
});

app.get('/admin-portfolio', async (req, res) => {
  try {
    // Retrieve a list of user names (Members)
    const users = await Member.find({}, 'name _id'); // Assuming you have a 'name' field in your Member model

    // Render the admin-portfolio page with the user names
    res.render('admin-portfolio', { users });
  } catch (error) {
    console.error(error);
    res.send('An error occurred while fetching user data.');
  }
});

app.get('/admin-portfolio/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await Member.findById(userId);
    if (!user) {
      res.send('User not found');
      return;
    }

    // You may want to fetch the user's portfolio content here based on the tag.
    // You can do this by querying the Portfolio model.

    // For simplicity, let's assume you retrieve the content here. You may need to adjust this part.
    const portfolioContent = 'Portfolio content for the selected user';

    res.render('user-portfolio', { user, portfolioContent });
  } catch (error) {
    console.error(error);
    res.send('An error occurred while fetching user data.');
  }
});

app.get('/user-portfolio/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const user = await Member.findOne({ name: username });

    if (!user) {
      res.send('User not found');
      return;
    }

    // Render the user-portfolio template and pass the user data and pie chart data.
    res.render('user-portfolio', { user });
  } catch (error) {
    console.error(error);
    res.send('An error occurred while fetching user data.');
  }
});

const port = process.env.PORT || 3003;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
