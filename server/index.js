const express = require('express');
const cors = require('cors');
const { Novu } = require('@novu/node');

const app = express();
const PORT = 4000;
const novu = new Novu('617833f6a0a4f5884a506f42231ef280');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const users = [];
const generateID = () => Math.random().toString(36).substring(2, 10);

app.get('/api', (req, res) => {
  res.json({ message: 'HELLO WORLD' });
});

app.post('/api/register', (req, res) => {
  const { email, password, tel, username } = req.body;
  console.log('details in server', { email, password, tel, username });

  let result = users.filter(
    (user) => user.email === email || users.tel === tel
  );
  if (result.length === 0) {
    const newUser = { id: generateID(), email, password, username, tel };
    users.push(newUser);

    return res.json({
      message: 'Account created successfully!',
    });
  }
  //👇🏻 Runs if a user exists
  res.json({
    error_message: 'User already exists',
  });
});

const generateCode = () => Math.random().toString(36).substring(2, 12);

const sendNovuNotification = async (recipient, verificationCode) => {
  try {
    let response = await novu.trigger('<NOTIFICATION_TEMPLATE_ID>', {
      to: {
        subscriberId: recipient,
        phone: recipient,
      },
      payload: {
        code: verificationCode,
      },
    });
    console.log(response);
  } catch (err) {
    console.error(err);
  }
};

app.post('api/login', (req, res) => {
  const { email, password } = req.body;
  let result = users.filter(
    (user) => user.email === email && user.password === password
  );

  if (result.length !== 1) {
    return res.json({
      error_message: 'Incorrect credentials',
    });
  }
  code = generateCode();

  //👇🏻 Send the SMS via Novu
  sendNovuNotification(result[0].tel, code);
  res.json({
    message: 'Login success',
    data: {
      username: result[0].username,
    },
  });
});

app.post('/api/verification', (req, res) => {
  if (code === req.body.code) {
    return res.json({ message: "You're verified successfully" });
  }
  res.json({
    error_message: 'Incorrect credentials',
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
